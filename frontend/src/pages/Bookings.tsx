import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { toast } from "sonner";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  Home,
  MapPin,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "../store/auth.store";

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
    pricePerNight?: number;
  };
  guest: { name: string };
}

interface BookingsResponse {
  data: Booking[];
}

const tabs = ["upcoming", "past", "cancelled"] as const;
type Tab = (typeof tabs)[number];

const statusStyle = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  pending: {
    label: "Pending",
    icon: CircleDashed,
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  },
};

const emptyText: Record<Tab, string> = {
  upcoming: "Your next reservations will appear here after you book a stay.",
  past: "Completed stays will appear here after checkout.",
  cancelled: "Cancelled reservations will appear here.",
};

export default function Bookings() {
  const { user } = useAuthStore();
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
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["guest-bookings"] });
    },
    onError: () => toast.error("Failed to cancel booking"),
  });

  const bookingList = bookings?.data ?? [];

  const handleCancel = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      cancelMutation.mutate(id);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.08] dark:bg-[#111827]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--color-primary)/10 text-(--color-primary)">
            <CalendarDays className="h-5 w-5" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-gray-950 dark:text-white">
            Log in to view bookings
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-gray-500 dark:text-gray-400">
            Your trip history is saved to your account.
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
    <div className="min-h-screen py-8">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-widest text-(--color-primary)">
            Trips
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">
            Bookings
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-6 text-gray-500 dark:text-gray-400">
            Review your reservations, dates, status, and booking totals.
          </p>
        </div>
        <Link
          to="/all-listings"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.04]"
        >
          <Search className="h-4 w-4" />
          Find stays
        </Link>
      </header>

      <div className="mb-7 flex items-center justify-between gap-4 border-b border-gray-200 dark:border-white/[0.08]">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-1 pb-3 text-[14px] font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "border-gray-950 text-gray-950 dark:border-white dark:text-white"
                  : "border-transparent text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="hidden pb-3 text-[13px] text-gray-500 dark:text-gray-400 sm:block">
          {bookingList.length}{" "}
          {bookingList.length === 1 ? "booking" : "bookings"}
        </span>
      </div>

      {isLoading ? (
        <BookingSkeleton />
      ) : bookingList.length === 0 ? (
        <EmptyState activeTab={activeTab} />
      ) : (
        <div className="grid gap-4">
          {bookingList.map((booking) => (
            <BookingItem
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

function BookingItem({
  booking,
  onCancel,
  isCancelling,
}: {
  booking: Booking;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}) {
  const status = statusStyle[booking.status];
  const StatusIcon = status.icon;
  const nights = calcNights(booking.checkIn, booking.checkOut);
  const averageNightPrice =
    nights > 0 ? Math.round(booking.totalPrice / nights) : booking.totalPrice;

  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-[#111827]">
      <div className="grid md:grid-cols-[190px_1fr]">
        <Link
          to={`/listings/${booking.listing.id}`}
          className="block h-56 bg-gray-100 dark:bg-white/[0.05] md:h-full"
        >
          {booking.listing.photos?.[0] ? (
            <img
              src={booking.listing.photos[0]}
              alt={booking.listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <Home className="h-7 w-7" />
            </div>
          )}
        </Link>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${status.className}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
                <span className="text-[12px] text-gray-400">
                  Booked {formatDate(booking.createdAt)}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold leading-tight text-gray-950 dark:text-white">
                {booking.listing.title}
              </h2>
              <p className="mt-2 flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-(--color-primary)" />
                <span className="truncate">{booking.listing.location}</span>
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.04] lg:min-w-40 lg:text-right">
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                Total
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">
                ${Math.round(booking.totalPrice)}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <DetailBox
              icon={CalendarDays}
              label="Check-in"
              value={formatDate(booking.checkIn)}
            />
            <DetailBox
              icon={CalendarDays}
              label="Check-out"
              value={formatDate(booking.checkOut)}
            />
            <DetailBox
              icon={Clock3}
              label="Duration"
              value={`${nights} ${nights === 1 ? "night" : "nights"}`}
            />
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-5 dark:border-white/[0.06] lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              About ${averageNightPrice} per night
            </p>
            <div className="flex flex-wrap gap-2">
              {booking.status === "pending" && (
                <button
                  onClick={() => onCancel(booking.id)}
                  disabled={isCancelling}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-[13px] font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                >
                  <X className="h-4 w-4" />
                  {isCancelling ? "Cancelling..." : "Cancel"}
                </button>
              )}
              <Link
                to={`/listings/${booking.listing.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-(--color-primary-dark)"
              >
                View listing
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function DetailBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 dark:border-white/[0.08]">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-[14px] font-semibold text-gray-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ activeTab }: { activeTab: Tab }) {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-gray-200 bg-white px-6 text-center dark:border-white/[0.08] dark:bg-[#111827]">
      <div className="max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--color-primary)/10 text-(--color-primary)">
          <CalendarDays className="h-5 w-5" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-gray-950 dark:text-white">
          No {activeTab} bookings
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-gray-500 dark:text-gray-400">
          {emptyText[activeTab]}
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
  );
}

function BookingSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="grid overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-[#111827] md:grid-cols-[190px_1fr]"
        >
          <div className="h-56 bg-gray-100 dark:bg-white/[0.05] animate-pulse md:h-auto" />
          <div className="space-y-4 p-6">
            <div className="h-5 w-28 rounded bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
            <div className="h-7 w-2/3 rounded bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="h-20 rounded-2xl bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
              <div className="h-20 rounded-2xl bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
              <div className="h-20 rounded-2xl bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
            </div>
          </div>
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

function calcNights(checkIn: string, checkOut: string) {
  return Math.max(
    0,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
}
