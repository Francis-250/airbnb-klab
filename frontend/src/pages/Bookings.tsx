import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Clock3,
  ChevronRight,
  X,
  ReceiptText,
  Luggage,
  Search,
  Home,
  CircleCheck,
  CircleDashed,
  CircleX,
} from "lucide-react";

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  listing: {
    id: string;
    title: string;
    location: string;
    photos: string[];
    pricePerNight: number;
  };
  guest: { name: string };
}

interface BookingsResponse {
  data: Booking[];
}

const statusConfig = {
  confirmed: {
    label: "Confirmed",
    icon: CircleCheck,
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  },
  pending: {
    label: "Pending",
    icon: CircleDashed,
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: CircleX,
    className:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20",
  },
};

const tabs = ["upcoming", "past", "cancelled"] as const;
type Tab = (typeof tabs)[number];

const tabCopy: Record<Tab, { title: string; empty: string }> = {
  upcoming: {
    title: "Upcoming",
    empty: "When you reserve a stay, your next trip will show up here.",
  },
  past: {
    title: "Past",
    empty: "Completed trips will appear here after checkout.",
  },
  cancelled: {
    title: "Cancelled",
    empty: "Cancelled reservations will appear here.",
  },
};

export default function Bookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["guest-bookings", activeTab],
    queryFn: async () => {
      const response = await api.get(`/bookings?status=${activeTab}`);
      return response.data as BookingsResponse;
    },
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/bookings/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Booking cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["guest-bookings"] });
    },
    onError: () => toast.error("Failed to cancel booking"),
  });

  const handleCancel = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      cancelMutation.mutate(id);
    }
  };

  const bookingList = bookings?.data ?? [];
  const totalCost = bookingList.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0,
  );
  const totalNights = bookingList.reduce(
    (sum, booking) => sum + calcNights(booking.checkIn, booking.checkOut),
    0,
  );

  if (!user) {
    return (
      <div className="flex min-h-[72vh] items-center justify-center px-4">
        <div className="max-w-md rounded-[2rem] border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-white/[0.08] dark:bg-[#111827]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-primary)/10 text-(--color-primary)">
            <Luggage className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-gray-950 dark:text-white">
            Log in to see your trips
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-gray-500 dark:text-gray-400">
            Your reservations, dates, and receipts are saved to your account.
          </p>
          <Link
            to="/login?redirect=/bookings"
            className="mt-6 inline-flex rounded-xl bg-(--color-primary) px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-(--color-primary-dark)"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 lg:py-8">
      <section className="mb-8 overflow-hidden rounded-[2rem] border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-[#111827]">
        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-(--color-primary)/10 px-3 py-1.5 text-[12px] font-semibold text-(--color-primary)">
                <Luggage className="h-3.5 w-3.5" />
                Guest trips
              </span>
              <span className="text-[13px] text-gray-500 dark:text-gray-400">
                Manage every stay in one place
              </span>
            </div>
            <h1
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-gray-950 dark:text-white md:text-5xl"
            >
              Your bookings, beautifully organized.
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-gray-500 dark:text-gray-400">
              Check trip dates, reservation status, pricing, and quick actions
              without digging through your account.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/all-listings"
                className="inline-flex items-center gap-2 rounded-xl bg-(--color-primary) px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-(--color-primary-dark)"
              >
                <Search className="h-4 w-4" />
                Find another stay
              </Link>
              <Link
                to="/favorites"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-[13px] font-semibold text-gray-700 transition-colors hover:border-(--color-primary) hover:text-(--color-primary) dark:border-white/[0.08] dark:text-gray-300"
              >
                <Home className="h-4 w-4" />
                Saved places
              </Link>
            </div>
          </div>
          <div className="grid border-t border-gray-200 bg-gray-50 p-5 dark:border-white/[0.08] dark:bg-white/[0.03] sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:border-t-0">
            <TripStat label={`${tabCopy[activeTab].title} trips`} value={bookingList.length} />
            <TripStat label="Nights" value={totalNights} />
            <TripStat label="Total value" value={`$${totalCost}`} />
          </div>
        </div>
      </section>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-2 dark:border-white/[0.08] dark:bg-[#111827] lg:w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`min-w-fit rounded-xl px-5 py-3 text-[13px] font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
              }`}
            >
              {tabCopy[tab].title}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-gray-500 dark:text-gray-400">
          Showing {bookingList.length} {bookingList.length === 1 ? "booking" : "bookings"}
        </p>
      </div>

      {isLoading ? (
        <BookingSkeleton />
      ) : bookingList.length === 0 ? (
        <EmptyState activeTab={activeTab} />
      ) : (
        <div className="space-y-5">
          {bookingList.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
              isCancelling={cancelMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
  isCancelling,
}: {
  booking: Booking;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}) {
  const status = statusConfig[booking.status];
  const StatusIcon = status.icon;
  const nights = calcNights(booking.checkIn, booking.checkOut);
  const checkIn = dateParts(booking.checkIn);
  const checkOut = dateParts(booking.checkOut);

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-black/[0.06] dark:border-white/[0.08] dark:bg-[#111827] dark:hover:shadow-black/30">
      <div className="grid lg:grid-cols-[190px_1fr_280px]">
        <div className="relative min-h-64 bg-gray-100 dark:bg-white/[0.05] lg:min-h-full">
          {booking.listing.photos?.[0] ? (
            <img
              src={booking.listing.photos[0]}
              alt={booking.listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <MapPin className="h-7 w-7" />
            </div>
          )}
          <span
            className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${status.className}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Reservation
              </p>
              <h2 className="mt-1 text-xl font-semibold leading-snug text-gray-950 dark:text-white">
                {booking.listing.title}
              </h2>
              <p className="mt-2 flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-(--color-primary)" />
                <span className="truncate">{booking.listing.location}</span>
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-3 text-left dark:bg-white/[0.04] md:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Total
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">
                ${booking.totalPrice}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <DateBox label="Check-in" parts={checkIn} />
            <DateBox label="Check-out" parts={checkOut} />
            <div className="rounded-2xl border border-gray-200 p-4 dark:border-white/[0.08]">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                <Clock3 className="h-3.5 w-3.5" />
                Duration
              </div>
              <p className="mt-3 text-lg font-semibold text-gray-950 dark:text-white">
                {nights}
              </p>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                {nights === 1 ? "night" : "nights"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between border-t border-gray-200 bg-gray-50 p-5 dark:border-white/[0.08] dark:bg-white/[0.03] lg:border-l lg:border-t-0">
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 dark:bg-[#111827]">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Price breakdown
              </p>
              <div className="mt-3 flex justify-between text-[13px] text-gray-600 dark:text-gray-300">
                <span>
                  ${booking.listing.pricePerNight} x {nights} nights
                </span>
                <span>${booking.listing.pricePerNight * nights}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-[14px] font-semibold text-gray-950 dark:border-white/[0.08] dark:text-white">
                <span>Paid total</span>
                <span>${booking.totalPrice}</span>
              </div>
            </div>
            <p className="flex items-center gap-2 text-[12px] text-gray-500 dark:text-gray-400">
              <ReceiptText className="h-4 w-4 text-(--color-primary)" />
              Booked {formatDate(booking.createdAt)}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Link
              to={`/listings/${booking.listing.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-(--color-primary-dark)"
            >
              View listing
              <ChevronRight className="h-4 w-4" />
            </Link>
            {booking.status === "pending" && (
              <button
                onClick={() => onCancel(booking.id)}
                disabled={isCancelling}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-[13px] font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
              >
                <X className="h-4 w-4" />
                {isCancelling ? "Cancelling..." : "Cancel request"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function DateBox({
  label,
  parts,
}: {
  label: string;
  parts: { month: string; day: string; year: string };
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 dark:border-white/[0.08]">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        <Calendar className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <p className="text-3xl font-semibold leading-none text-gray-950 dark:text-white">
          {parts.day}
        </p>
        <p className="pb-0.5 text-[13px] font-semibold text-gray-500 dark:text-gray-400">
          {parts.month} {parts.year}
        </p>
      </div>
    </div>
  );
}

function TripStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0 dark:border-white/[0.08] sm:border-b-0 sm:border-r sm:px-4 sm:last:border-r-0 lg:border-b lg:border-r-0 lg:px-0">
      <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ activeTab }: { activeTab: Tab }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-[#111827]">
      <div className="grid min-h-[360px] place-items-center px-6 py-16 text-center">
        <div className="max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-(--color-primary)/10 text-(--color-primary)">
            <ReceiptText className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-gray-950 dark:text-white">
            No {activeTab} bookings yet
          </h2>
          <p className="mt-3 text-[14px] leading-6 text-gray-500 dark:text-gray-400">
            {tabCopy[activeTab].empty}
          </p>
          <Link
            to="/all-listings"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-(--color-primary) px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-(--color-primary-dark)"
          >
            <Search className="h-4 w-4" />
            Browse stays
          </Link>
        </div>
      </div>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="grid overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-[#111827] lg:grid-cols-[190px_1fr_280px]"
        >
          <div className="h-64 bg-gray-100 dark:bg-white/[0.05] animate-pulse lg:h-auto" />
          <div className="space-y-4 p-6">
            <div className="h-4 w-24 rounded bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
            <div className="h-7 w-2/3 rounded bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="h-24 rounded-2xl bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
              <div className="h-24 rounded-2xl bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
              <div className="h-24 rounded-2xl bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
            </div>
          </div>
          <div className="h-52 bg-gray-50 dark:bg-white/[0.03] animate-pulse lg:h-auto" />
        </div>
      ))}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function dateParts(d: string) {
  const date = new Date(d);
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }),
    day: date.toLocaleDateString("en-US", { day: "2-digit" }),
    year: date.toLocaleDateString("en-US", { year: "numeric" }),
  };
}

function calcNights(checkIn: string, checkOut: string) {
  return Math.max(
    0,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
}
