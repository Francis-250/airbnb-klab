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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuthStore } from "../../store/auth.store";

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

const chartColors = ["#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED"];

const tooltipStyle = {
  border: "1px solid #EBEBEB",
  borderRadius: "12px",
  boxShadow: "none",
  fontSize: "12px",
};

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const listingChartData =
    stats?.topListings?.map((listing) => ({
      name:
        listing.title.length > 18
          ? `${listing.title.slice(0, 18)}...`
          : listing.title,
      bookings: listing._count?.bookings ?? 0,
      revenue: (listing._count?.bookings ?? 0) * listing.pricePerNight,
    })) ?? [];

  const bookingStatusData = Object.entries(
    (stats?.recentBookings ?? []).reduce<Record<string, number>>(
      (acc, booking) => {
        const status = booking.status || "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {},
    ),
  ).map(([name, value]) => ({ name, value }));

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
          Welcome back, {user?.name}
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

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#F0F0F0] dark:border-[#2A2A2A] p-5">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-base font-semibold text-[#111] dark:text-white"
              >
                Listing Performance
              </h2>
              <p className="text-[12px] text-[#AAAAAA] mt-0.5">
                Bookings and estimated revenue by top listing.
              </p>
            </div>
          </div>

          <div className="h-72">
            {listingChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={listingChartData} margin={{ left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#717171" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: "#717171" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "#717171" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) =>
                      name === "revenue" ? [`$${value}`, "Revenue"] : [value, "Bookings"]
                    }
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="bookings"
                    fill="#2563EB"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={42}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="revenue"
                    fill="#059669"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-[#F7F7F7] text-[13px] text-[#AAAAAA] dark:bg-[#222]">
                No listing performance yet
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#F0F0F0] dark:border-[#2A2A2A] p-5">
          <h2
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-base font-semibold text-[#111] dark:text-white"
          >
            Booking Status
          </h2>
          <p className="text-[12px] text-[#AAAAAA] mt-0.5">
            Recent booking mix by status.
          </p>

          <div className="mt-4 h-72">
            {bookingStatusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={4}
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-[#F7F7F7] text-[13px] text-[#AAAAAA] dark:bg-[#222]">
                No booking status data
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {bookingStatusData.map((entry, index) => (
              <span
                key={entry.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#F0F0F0] px-2.5 py-1 text-[11px] font-medium capitalize text-[#717171] dark:border-[#2A2A2A]"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                />
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        </div>
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
