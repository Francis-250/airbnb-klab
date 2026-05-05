import { Request, Response } from "express";
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

  try {
    const where =
      role === "guest" ? { guestId: user } : { listing: { hostId: user } };
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          guest: { select: { name: true, avatar: true } },
          listing: { select: { title: true, location: true } },
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

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

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
      subject: "Welcome to Airbnb!",
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
      include: { listing: true },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (role === "host" && booking.listing.hostId !== user) {
      return res
        .status(403)
        .json({ message: "Only the host can update booking status" });
    }

    if (role === "guest") {
      return res
        .status(403)
        .json({ message: "Guests are not allowed to update booking status" });
    }

    const updated = await prisma.booking.update({
      where: { id: id as string },
      data: { status },
    });
    const message =
      status === "approved"
        ? "Your booking has been approved!"
        : "Your booking has been rejected.";
    const guest = await prisma.user.findUnique({ where: { id: user } });
    await sendEmail({
      to: guest?.email as string,
      subject: "Welcome to Airbnb!",
      html: bookingStatusEmail(status),
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
