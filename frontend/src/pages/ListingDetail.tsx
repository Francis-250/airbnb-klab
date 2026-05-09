import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Heart,
  Share2,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
  BadgeCheck,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Wind,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Listing } from "../types";
import Spinner from "../components/Spinner";

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  parking: Car,
  kitchen: Utensils,
  gym: Dumbbell,
  pool: Waves,
  ac: Wind,
};

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);

  const {
    data: listing,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const res = await api.get(`/listings/${id}`);
      return (res.data.listing ?? res.data) as Listing;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-red-500">Failed to load listing.</p>
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

  const images = listing.photos?.length ? listing.photos : ["/image/hero-background.jpg"];
  const galleryImages = images.slice(0, 5);
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAP_API_KEY}&q=${encodeURIComponent(listing.location)}`;
  const currentImage = images[sliderIndex % images.length];

  const prevSlide = () =>
    setSliderIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextSlide = () =>
    setSliderIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="min-h-screen pb-14">
      <div className="mb-5 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-700 transition-colors hover:border-(--color-primary) hover:text-(--color-primary) dark:border-white/[0.08] dark:text-gray-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-700 transition-colors hover:border-(--color-primary) hover:text-(--color-primary) dark:border-white/[0.08] dark:text-gray-300">
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={() => setIsSaved((value) => !value)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-700 transition-colors hover:border-(--color-primary) hover:text-(--color-primary) dark:border-white/[0.08] dark:text-gray-300"
          >
            <Heart
              className={`h-4 w-4 ${isSaved ? "fill-(--color-primary) text-(--color-primary)" : ""}`}
            />
            Save
          </button>
        </div>
      </div>

      <header className="mb-5">
        <h1
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-3xl font-semibold leading-tight text-gray-950 dark:text-white md:text-4xl"
        >
          {listing.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[14px] text-gray-500 dark:text-gray-400">
          {listing.rating && (
            <span className="inline-flex items-center gap-1 font-semibold text-gray-950 dark:text-white">
              <Star className="h-4 w-4 fill-amber-400 stroke-none" />
              {listing.rating}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4 text-(--color-primary)" />
            {listing.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-4 w-4" />
            {listing.guests} guests
          </span>
        </div>
      </header>

      <section className="mb-10">
        <div className="relative block overflow-hidden rounded-[1.75rem] bg-gray-100 dark:bg-white/[0.05] sm:hidden">
          <img
            src={currentImage}
            alt={listing.title}
            className="h-80 w-full object-cover"
          />
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-950 shadow-sm"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-950 shadow-sm"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden h-[520px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-[1.75rem] sm:grid">
          {galleryImages.map((photo, index) => (
            <img
              key={`${photo}-${index}`}
              src={photo}
              alt={`${listing.title} ${index + 1}`}
              className={`h-full w-full object-cover ${index === 0 ? "col-span-2 row-span-2" : ""}`}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <main>
          <section className="border-b border-gray-200 pb-7 dark:border-white/[0.08]">
            <div className="flex items-start gap-4">
              {listing.host?.avatar ? (
                <img
                  src={listing.host.avatar}
                  alt={listing.host.name || "Host"}
                  className="h-14 w-14 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-primary)/10 text-lg font-semibold text-(--color-primary)">
                  {(listing.host?.name || "H").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                  Hosted by {listing.host?.name || "Host"}
                </h2>
                <p className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">
                  {listing.type} in {listing.location}
                </p>
              </div>
              <BadgeCheck className="ml-auto h-5 w-5 text-(--color-primary)" />
            </div>
          </section>

          <section className="border-b border-gray-200 py-7 dark:border-white/[0.08]">
            <h2 className="text-xl font-semibold text-gray-950 dark:text-white">
              About this place
            </h2>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-gray-600 dark:text-gray-300">
              {listing.description ||
                "This stay has all the essentials for a comfortable visit."}
            </p>
          </section>

          <section className="border-b border-gray-200 py-7 dark:border-white/[0.08]">
            <h2 className="text-xl font-semibold text-gray-950 dark:text-white">
              What this place offers
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(listing.amenities?.length ? listing.amenities : ["Guests", "Private stay"]).map(
                (amenity) => {
                  const Icon = amenityIcons[amenity.toLowerCase()] || Check;
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-[14px] text-gray-700 dark:border-white/[0.08] dark:text-gray-300"
                    >
                      <Icon className="h-4 w-4 text-(--color-primary)" />
                      {amenity}
                    </div>
                  );
                },
              )}
            </div>
          </section>

          <section className="py-7">
            <h2 className="text-xl font-semibold text-gray-950 dark:text-white">
              Location
            </h2>
            <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-white/[0.08] dark:bg-white/[0.05]">
              <iframe
                title="Property location"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={mapUrl}
              />
            </div>
          </section>
        </main>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-xl shadow-black/[0.06] dark:border-white/[0.08] dark:bg-[#111827] dark:shadow-black/30">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <span className="text-2xl font-semibold text-gray-950 dark:text-white">
                  ${listing.pricePerNight}
                </span>
                <span className="text-[14px] text-gray-500"> / night</span>
              </div>
              {listing.rating && (
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-gray-950 dark:text-white">
                  <Star className="h-3.5 w-3.5 fill-amber-400 stroke-none" />
                  {listing.rating}
                </span>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 dark:border-white/[0.08]">
              <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-white/[0.08]">
                <div className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    Check-in
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-gray-950 dark:text-white">
                    Add date
                  </p>
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    Check-out
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-gray-950 dark:text-white">
                    Add date
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 p-3 dark:border-white/[0.08]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  Guests
                </p>
                <p className="mt-1 text-[13px] font-medium text-gray-950 dark:text-white">
                  Up to {listing.guests} guests
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/bookings/${id}`)}
              className="mt-5 w-full rounded-xl bg-(--color-primary) px-5 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-(--color-primary-dark)"
            >
              Reserve
            </button>
            <p className="mt-3 text-center text-[12px] text-gray-500 dark:text-gray-400">
              You will not be charged yet.
            </p>
            <Link
              to={`/listings/${id}/reviews`}
              className="mt-4 inline-flex w-full justify-center rounded-xl border border-gray-200 px-5 py-3 text-[13px] font-semibold text-gray-700 transition-colors hover:border-(--color-primary) hover:text-(--color-primary) dark:border-white/[0.08] dark:text-gray-300"
            >
              Read reviews
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
