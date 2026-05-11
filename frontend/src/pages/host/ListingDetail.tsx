import Spinner from "../../components/Spinner";
import {
  CalendarDays,
  DollarSign,
  Home,
  MapPin,
  Pen,
  Star,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useListing } from "../../hooks/useListings";

const fallbackPhoto =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";

const statusStyles: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  booked: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  unavailable: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function DashboardListingDetail() {
  const { id } = useParams();
  const { data: listing, isLoading, error, isFetching } = useListing(id!);

  if (isLoading || isFetching) return <Spinner />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Error loading listing details: {error.message}
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="rounded-2xl border border-[#DDE2EA] bg-white p-6 text-sm text-[#667085]">
        Listing not found.
      </div>
    );
  }

  const photos = listing.photos?.length ? listing.photos : [fallbackPhoto];
  const createdAt = new Date(listing.createdAt).toLocaleDateString();
  const updatedAt = new Date(listing.updatedAt).toLocaleDateString();

  return (
    <div className="min-h-full bg-[#F4F6F9] dark:bg-[#111827] -m-4 sm:-m-6 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-white/70 dark:border-[#2A2A2A] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-[#111827] dark:text-white">
                Listing Details
              </h1>
              <p className="text-xs text-[#667085] dark:text-[#AAAAAA]">
                Last update {updatedAt}
              </p>
            </div>
          </div>

          <Link
            to={`/dashboard/listings/edit/${listing.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-black dark:bg-white dark:text-[#111827]"
          >
            <Pen className="h-4 w-4" />
            Edit Listing
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-4">
            <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-white/70 dark:border-[#2A2A2A] p-4 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr]">
                <div className="relative min-h-72 overflow-hidden rounded-xl bg-[#F8FAFC] dark:bg-[#111827]">
                  <img
                    src={photos[0]}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#344054]">
                    Cover
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((slot) => (
                    <div
                      key={slot}
                      className="aspect-square overflow-hidden rounded-xl border border-[#DDE2EA] bg-[#F8FAFC] dark:border-[#2A2A2A] dark:bg-[#111827]"
                    >
                      {photos[slot] ? (
                        <img
                          src={photos[slot]}
                          alt={`${listing.title} ${slot + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[#98A2B3]">
                          No photo
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard
                title="Status"
                value={listing.status}
                tone={statusStyles[listing.status]}
              />
              <InfoCard title="Host" value={listing.host?.name || "Verified"} />
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-white/70 dark:border-[#2A2A2A] p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold capitalize text-[#344054] dark:bg-[#111827] dark:text-white">
                    {listing.type}
                  </span>
                  <h2 className="mt-3 text-2xl font-semibold text-[#111827] dark:text-white">
                    {listing.title}
                  </h2>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-[#667085]">
                    <MapPin className="h-4 w-4" />
                    {listing.location}
                  </p>
                </div>
                <div className="rounded-xl border border-[#EAECF0] px-4 py-3 text-right dark:border-[#2A2A2A]">
                  <p className="text-2xl font-semibold text-[#111827] dark:text-white">
                    ${listing.pricePerNight}
                  </p>
                  <p className="text-xs text-[#667085]">per night</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <Metric icon={Users} label="Guests" value={listing.guests} />
                <Metric icon={Home} label="Type" value={listing.type} />
                <Metric
                  icon={Star}
                  label="Rating"
                  value={listing.rating ?? 0}
                />
                <Metric
                  icon={DollarSign}
                  label="Nightly"
                  value={`$${listing.pricePerNight}`}
                />
              </div>

              <div className="mt-6 border-t border-[#EAECF0] pt-5 dark:border-[#2A2A2A]">
                <h3 className="text-sm font-semibold text-[#111827] dark:text-white">
                  Description
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#667085] dark:text-[#AAAAAA]">
                  {listing.description || "No description added yet."}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-white/70 dark:border-[#2A2A2A] p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#111827] dark:text-white">
                Amenities
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {listing.amenities?.length ? (
                  listing.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-full border border-[#DDE2EA] px-3 py-1.5 text-xs font-medium capitalize text-[#344054] dark:border-[#2A2A2A] dark:text-white"
                    >
                      {amenity}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-[#667085]">No amenities added.</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DateCard label="Created" value={createdAt} />
              <DateCard label="Updated" value={updatedAt} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-white/70 dark:border-[#2A2A2A] p-4 shadow-sm">
      <p className="text-sm font-semibold text-[#111827] dark:text-white">
        {title}
      </p>
      <span
        className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ${
          tone || "bg-[#F8FAFC] text-[#344054] dark:bg-[#111827] dark:text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-[#EAECF0] p-3 dark:border-[#2A2A2A]">
      <Icon className="h-4 w-4 text-[#667085]" />
      <p className="mt-2 text-xs text-[#667085]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold capitalize text-[#111827] dark:text-white">
        {value}
      </p>
    </div>
  );
}

function DateCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-white/70 dark:border-[#2A2A2A] p-4 shadow-sm">
      <CalendarDays className="h-5 w-5 text-[#667085]" />
      <p className="mt-3 text-xs text-[#667085]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#111827] dark:text-white">
        {value}
      </p>
    </div>
  );
}
