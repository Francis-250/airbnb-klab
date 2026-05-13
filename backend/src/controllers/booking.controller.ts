import { Request, Response } from "express";
import { BookingStatus, Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { sendEmail } from "../middleware/resend";
import {
  bookingConfirmationEmail,
  bookingStatusEmail,
} from "../templates/mail.temp";

export const getAllBookings = async (req: Request, res: Response) => {
  const user = req.user;
  const role = req.role;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status as string | undefined;
  const now = new Date();

  try {
    const baseWhere: Prisma.BookingWhereInput =
      role === "guest" ? { guestId: user } : { listing: { hostId: user } };
    const where: Prisma.BookingWhereInput =
      status === "upcoming"
        ? {
            ...baseWhere,
            status: { in: [BookingStatus.pending, BookingStatus.confirmed] },
            checkOut: { gte: now },
          }
        : status === "past"
          ? {
              ...baseWhere,
              status: { not: BookingStatus.cancelled },
              checkOut: { lt: now },
            }
          : status === "cancelled"
            ? { ...baseWhere, status: BookingStatus.cancelled }
            : baseWhere;
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          guest: { select: { name: true, email: true, avatar: true } },
          listing: {
            select: {
              id: true,
              title: true,
              location: true,
              photos: true,
              pricePerNight: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.status(200).json({
      data: bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const role = req.role;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
      include: {
        guest: true,
        listing: true,
      },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (role === "guest" && booking.guestId !== user) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (role === "host" && booking.listing.hostId !== user) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  const user = req.user;
  const { listingId, checkIn, checkOut } = req.body;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (
    Number.isNaN(checkInDate.getTime()) ||
    Number.isNaN(checkOutDate.getTime())
  ) {
    return res
      .status(400)
      .json({ message: "Valid check-in and check-out dates are required" });
  }

  if (checkOutDate <= checkInDate) {
    return res
      .status(400)
      .json({ message: "Check-out must be after check-in" });
  }

  try {
    const listing = await prisma.listing.findFirst({
      where: { id: listingId, host: { hostStatus: "approved" } },
    });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { not: BookingStatus.cancelled },
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
      select: { id: true },
    });

    if (overlappingBooking) {
      return res.status(409).json({
        message: "These dates are unavailable because the listing is already booked",
      });
    }

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = nights * listing.pricePerNight;

    const booking = await prisma.booking.create({
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        guestId: user,
        listingId,
      },
    });
    const guest = await prisma.user.findUnique({ where: { id: user } });
    await sendEmail({
      to: guest?.email as string,
      subject: `Booking Confirmation - ${listing.title}`,
      html: bookingConfirmationEmail(listing.title, checkIn, checkOut),
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const role = req.role;
  const { status } = req.body;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
      include: { listing: true, guest: true },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (role === "host") {
      const host = await prisma.user.findUnique({
        where: { id: user },
        select: { hostStatus: true },
      });

      if (!host || host.hostStatus !== "approved") {
        return res.status(403).json({
          message:
            "Your host account must be approved before performing this action",
        });
      }
    }

    if (role === "host" && booking.listing.hostId !== user) {
      return res
        .status(403)
        .json({ message: "Only the host can update booking status" });
    }

    if (role !== "host") {
      return res
        .status(403)
        .json({ message: "Only hosts can update booking status" });
    }

    const updated = await prisma.booking.update({
      where: { id: id as string },
      data: { status },
    });

    await sendEmail({
      to: booking.guest?.email as string,
      subject: `Booking Status Update: ${status}`,
      html: bookingStatusEmail(status, booking.listing.title),
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.guestId !== user) {
      return res
        .status(403)
        .json({ message: "You can only cancel your own bookings" });
    }

    await prisma.booking.delete({ where: { id: id as string } });
    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
