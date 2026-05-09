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
  Home,
  CalendarDays,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Listing } from "../types";
import Spinner from "../components/Spinner";

const amenityIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
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

  const images = listing.photos?.length
    ? listing.photos
    : ["/image/hero-background.jpg"];
  const galleryImages = images.slice(0, 5);
  const currentImage = images[sliderIndex % images.length];
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAP_API_KEY}&q=${encodeURIComponent(listing.location)}`;

  const prevSlide = () =>
    setSliderIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  const nextSlide = () =>
    setSliderIndex((index) => (index === images.length - 1 ? 0 : index + 1));

  return (
    <div className="min-h-screen pb-16">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.04]">
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsSaved((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.04]"
          >
            <Heart
              className={`h-4 w-4 ${isSaved ? "fill-(--color-primary) text-(--color-primary)" : ""}`}
            />
          </button>
        </div>
      </div>

      <header className="mb-5 max-w-5xl">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400">
          {listing.type}
        </p>
        <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-gray-950 dark:text-white md:text-3xl">
          {listing.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-gray-500 dark:text-gray-400">
          {listing.rating && (
            <span className="inline-flex items-center gap-1 font-semibold text-gray-950 dark:text-white">
              <Star className="h-4 w-4 fill-gray-900 stroke-none dark:fill-white" />
              {listing.rating.toFixed(2).replace(/0$/, "")}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {listing.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Up to {listing.guests} guests
          </span>
        </div>
      </header>

      <section className="mb-9">
        <div className="relative block overflow-hidden rounded-3xl bg-gray-100 dark:bg-white/[0.05] md:hidden">
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

        <div className="hidden h-[430px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:grid">
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

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <main className="min-w-0">
          <section className="border-b border-gray-200 pb-6 dark:border-white/[0.08]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {listing.host?.avatar ? (
                  <img
                    src={listing.host.avatar}
                    alt={listing.host.name || "Host"}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-base font-semibold text-gray-700 dark:bg-white/[0.08] dark:text-gray-200">
                    {(listing.host?.name || "H").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-[17px] font-semibold text-gray-950 dark:text-white">
                    Hosted by {listing.host?.name || "Host"}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">
                    {listing.host?.email || "Verified host"}
                  </p>
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-[12px] font-semibold text-gray-700 dark:bg-white/[0.06] dark:text-gray-200">
                <BadgeCheck className="h-4 w-4 text-(--color-primary)" />
                Verified
              </span>
            </div>
          </section>

          <section className="grid gap-3 border-b border-gray-200 py-6 dark:border-white/[0.08] sm:grid-cols-3">
            <Fact icon={Home} label="Type" value={listing.type} />
            <Fact
              icon={Users}
              label="Capacity"
              value={`${listing.guests} ${listing.guests === 1 ? "guest" : "guests"}`}
            />
            <Fact
              icon={CalendarDays}
              label="Rate"
              value={`$${listing.pricePerNight}/night`}
            />
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
              Amenities
            </h2>
            <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {(listing.amenities?.length
                ? listing.amenities
                : ["Private stay", "Guest ready"]
              ).map((amenity) => {
                const Icon = amenityIcons[amenity.toLowerCase()] || Check;
                return (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 text-[14px] text-gray-700 dark:text-gray-300"
                  >
                    <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    {amenity}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="py-7">
            <h2 className="text-xl font-semibold text-gray-950 dark:text-white">
              Where you will be
            </h2>
            <p className="mt-2 text-[14px] text-gray-500 dark:text-gray-400">
              {listing.location}
            </p>
            <div className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 dark:border-white/[0.08] dark:bg-white/[0.05]">
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

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-lg shadow-black/[0.05] dark:border-white/[0.08] dark:bg-[#111827] dark:shadow-black/25">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">
                  Starting at
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">
                  ${listing.pricePerNight}
                  <span className="text-[14px] font-normal text-gray-500">
                    {" "}
                    night
                  </span>
                </p>
              </div>
              {listing.rating && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1.5 text-[13px] font-semibold text-gray-950 dark:bg-white/[0.06] dark:text-white">
                  <Star className="h-3.5 w-3.5 fill-gray-900 stroke-none dark:fill-white" />
                  {listing.rating.toFixed(2).replace(/0$/, "")}
                </span>
              )}
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.08]">
              <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-white/[0.08]">
                <ReserveField label="Check-in" value="Add date" />
                <ReserveField label="Check-out" value="Add date" />
              </div>
              <div className="border-t border-gray-200 dark:border-white/[0.08]">
                <ReserveField
                  label="Guests"
                  value={`Up to ${listing.guests}`}
                />
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

            <div className="mt-5 space-y-2 border-t border-gray-200 pt-5 text-[14px] dark:border-white/[0.08]">
              <PriceLine
                label={`$${listing.pricePerNight} x 2 nights`}
                value={`$${Math.round(listing.pricePerNight * 2)}`}
              />
              <PriceLine label="Service fee" value="$0" />
              <PriceLine
                label="Estimated total"
                value={`$${Math.round(listing.pricePerNight * 2)}`}
                strong
              />
            </div>

            <Link
              to={`/listings/${id}/reviews`}
              className="mt-5 inline-flex w-full justify-center rounded-xl border border-gray-200 px-5 py-3 text-[13px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.04]"
            >
              Read reviews
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.04]">
      <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </p>
        <p className="mt-0.5 text-[14px] font-semibold capitalize text-gray-950 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function ReserveField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-medium text-gray-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function PriceLine({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 ${
        strong
          ? "pt-2 font-semibold text-gray-950 dark:text-white"
          : "text-gray-600 dark:text-gray-300"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
