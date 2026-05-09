import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { Users, MapPin, Check, Star, ArrowLeft, Calendar } from "lucide-react";
import type { Listing } from "../types";

export default function BookingForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const response = await api.get(`/listings/${id}`);
      return (response.data.listing ?? response.data) as Listing;
    },
    enabled: !!id,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: {
      listingId: string | undefined;
      checkIn: string;
      checkOut: string;
    }) => {
      const response = await api.post("/bookings", bookingData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Booking created successfully");
      navigate("/bookings");
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "Failed to create booking");
    },
  });

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.ceil(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;
  const totalPrice = listing ? nights * listing.pricePerNight : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error("Check-out must be after check-in");
      return;
    }

    createBookingMutation.mutate({ listingId: id, checkIn, checkOut });
  };

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-primary)/10 text-(--color-primary)">
            <Calendar className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-gray-950 dark:text-white">
            Log in to reserve
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-gray-500 dark:text-gray-400">
            Sign in before creating a booking for this stay.
          </p>
          <Link
            to={`/login?redirect=/bookings/${id}`}
            className="mt-6 inline-flex rounded-xl bg-(--color-primary) px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-(--color-primary-dark)"
          >
            Continue to login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-4">
            <div className="h-8 w-48 rounded-lg bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
            <div className="h-52 rounded-2xl bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
          </div>
          <div className="h-96 rounded-2xl bg-gray-100 dark:bg-white/[0.05] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">Listing not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-700 transition-colors hover:border-(--color-primary) hover:text-(--color-primary) dark:border-white/[0.08] dark:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listing
      </button>

      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <main>
          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-3xl font-semibold text-gray-950 dark:text-white"
          >
            Confirm and reserve
          </h1>

          <section className="mt-8 flex gap-4 border-b border-gray-200 pb-8 dark:border-white/[0.08]">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/[0.05]">
              {listing.photos?.[0] ? (
                <img
                  src={listing.photos[0]}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <MapPin className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400">
                {listing.type}
              </p>
              <h2 className="mt-1 truncate text-lg font-semibold text-gray-950 dark:text-white">
                {listing.title}
              </h2>
              <p className="mt-1 flex items-center gap-1 text-[13px] text-gray-500 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5" />
                {listing.location}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-[13px] text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {listing.guests} guests
                </span>
                {listing.rating && (
                  <span className="inline-flex items-center gap-1 font-semibold text-gray-950 dark:text-white">
                    <Star className="h-3.5 w-3.5 fill-amber-400 stroke-none" />
                    {listing.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="border-b border-gray-200 py-8 dark:border-white/[0.08]">
            <h2 className="text-xl font-semibold text-gray-950 dark:text-white">
              Your trip
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                  Check-in
                </span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-950 outline-none transition-colors focus:border-(--color-primary) dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                  Check-out
                </span>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-950 outline-none transition-colors focus:border-(--color-primary) dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                />
              </label>
            </div>
          </section>

          {listing.amenities?.length > 0 && (
            <section className="py-8">
              <h2 className="text-xl font-semibold text-gray-950 dark:text-white">
                Included with this stay
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {listing.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 text-[14px] text-gray-700 dark:text-gray-300"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-(--color-primary)/10 text-(--color-primary)">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {amenity}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="lg:sticky lg:top-24">
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-xl shadow-black/[0.06] dark:border-white/[0.08] dark:bg-[#111827] dark:shadow-black/30"
          >
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-gray-950 dark:text-white">
                ${listing.pricePerNight}
              </span>
              <span className="text-[14px] text-gray-500">per night</span>
            </div>

            <div className="mt-5 space-y-3 rounded-2xl border border-gray-200 p-4 dark:border-white/[0.08]">
              <div className="flex justify-between text-[14px] text-gray-600 dark:text-gray-300">
                <span>
                  ${listing.pricePerNight} x {nights} nights
                </span>
                <span>${totalPrice}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 dark:border-white/[0.08]">
                <div className="flex justify-between text-[16px] font-semibold text-gray-950 dark:text-white">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={createBookingMutation.isPending || nights <= 0}
              className="mt-5 w-full rounded-xl bg-(--color-primary) px-5 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-(--color-primary-dark) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createBookingMutation.isPending ? "Reserving..." : "Reserve"}
            </button>
            <p className="mt-3 text-center text-[12px] text-gray-500 dark:text-gray-400">
              You will not be charged yet.
            </p>
          </form>
        </aside>
      </div>
    </div>
  );
}
