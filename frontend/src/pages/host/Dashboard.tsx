import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import {
  Building2,
  CalendarCheck,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react";

interface Booking {
  id: string;
  totalPrice: number;
  status: string;
  listing: { title: string };
  guest: { name: string };
}

interface Listing {
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  _count: { bookings: number };
}

interface DashboardStats {
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  occupancyRate: number;
  pendingBookings: number;
  recentBookings: Booking[];
  topListings: Listing[];
}

const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get("/stats/dashboard");
  return response.data;
};

const statusConfig: Record<string, { label: string; class: string }> = {
  confirmed: {
    label: "Confirmed",
    class:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  pending: {
    label: "Pending",
    class:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const stats_config = [
  {
    key: "totalListings",
    label: "Total Listings",
    icon: Building2,
    format: (v: number) => v,
    accent: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    key: "totalBookings",
    label: "Total Bookings",
    icon: CalendarCheck,
    format: (v: number) => v,
    accent: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    icon: DollarSign,
    format: (v: number) => `$${v.toLocaleString()}`,
    accent: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    key: "averageRating",
    label: "Avg Rating",
    icon: Star,
    format: (v: number) => v?.toFixed(1) ?? "—",
    accent: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    key: "occupancyRate",
    label: "Occupancy",
    icon: TrendingUp,
    format: (v: number) => `${v}%`,
    accent: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    key: "pendingBookings",
    label: "Pending",
    icon: Clock,
    format: (v: number) => v,
    accent: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-56 bg-[#EBEBEB] dark:bg-[#2A2A2A] rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-[#EBEBEB] dark:bg-[#2A2A2A] animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 rounded-2xl bg-[#EBEBEB] dark:bg-[#2A2A2A] animate-pulse" />
          <div className="h-96 rounded-2xl bg-[#EBEBEB] dark:bg-[#2A2A2A] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[13px] text-[#AAAAAA] mb-0.5">Overview</p>
        <h1
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-2xl font-semibold text-[#111] dark:text-white"
        >
          Welcome back, {user?.name} 👋
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats_config.map(({ key, label, icon: Icon, format, accent, bg }) => {
          const value = stats?.[key as keyof DashboardStats] as number;
          return (
            <div
              key={key}
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 border border-[#F0F0F0] dark:border-[#2A2A2A] flex flex-col gap-3"
            >
              <div
                className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${accent}`} />
              </div>
              <div>
                <p className="text-[11px] text-[#AAAAAA] mb-0.5">{label}</p>
                <p className="text-xl font-semibold text-[#111] dark:text-white">
                  {format(value ?? 0)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#F0F0F0] dark:border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F0] dark:border-[#2A2A2A]">
            <h2
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-base font-semibold text-[#111] dark:text-white"
            >
              Recent Bookings
            </h2>
            <button className="flex items-center gap-1 text-[12px] text-(--color-primary) hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#F5F5F5] dark:divide-[#2A2A2A]">
            {stats?.recentBookings?.length ? (
              stats.recentBookings.map((booking) => {
                const s = statusConfig[booking.status?.toLowerCase()] ?? {
                  label: booking.status,
                  class: "bg-gray-100 text-gray-600",
                };
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FAFAFA] dark:hover:bg-[#222] transition-colors"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-[#111] dark:text-white truncate max-w-[160px]">
                        {booking.listing?.title}
                      </p>
                      <p className="text-[12px] text-[#AAAAAA] mt-0.5">
                        {booking.guest?.name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[13px] font-semibold text-[#111] dark:text-white">
                        ${booking.totalPrice}
                      </p>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.class}`}
                      >
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[13px] text-[#AAAAAA] px-5 py-8 text-center">
                No recent bookings
              </p>
            )}
          </div>
        </div>

        {/* Top Listings */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#F0F0F0] dark:border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F0] dark:border-[#2A2A2A]">
            <h2
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-base font-semibold text-[#111] dark:text-white"
            >
              Top Performing Listings
            </h2>
            <button className="flex items-center gap-1 text-[12px] text-(--color-primary) hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#F5F5F5] dark:divide-[#2A2A2A]">
            {stats?.topListings?.length ? (
              stats.topListings.map((listing, i) => (
                <div
                  key={listing.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#FAFAFA] dark:hover:bg-[#222] transition-colors"
                >
                  <span className="text-[12px] font-bold text-[#CCCCCC] dark:text-[#555] w-4 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#111] dark:text-white truncate">
                      {listing.title}
                    </p>
                    <p className="text-[12px] text-[#AAAAAA] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {listing.location}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-semibold text-[#111] dark:text-white">
                      ${listing.pricePerNight}
                      <span className="text-[11px] font-normal text-[#AAAAAA]">
                        /night
                      </span>
                    </p>
                    <p className="text-[12px] text-[#AAAAAA] mt-0.5">
                      {listing._count?.bookings ?? 0} bookings
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-[#AAAAAA] px-5 py-8 text-center">
                No listings yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
