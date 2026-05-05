import {
  CalendarCheck,
  Home,
  LayoutDashboard,
  Building2,
  Building,
  TreePine,
} from "lucide-react";
import type { CategoryProps } from "../types";

export const DashboardLinks = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Booking",
    url: "/dashboard/bookings",
    badge: null,
    icon: CalendarCheck,
  },
  { title: "Listing", url: "/dashboard/listings", badge: null, icon: Home },
];

export const Categories: CategoryProps[] = [
  {
    icon: Building2,
    title: "Villa",
    value: 3,
  },
  {
    icon: Building,
    title: "Apartment",
    value: 5,
  },
  {
    icon: Home,
    title: "House",
    value: 2,
  },
  {
    icon: TreePine,
    title: "Cabin",
    value: 4,
  },
];

export const bookingHeader = [
  "Check-in",
  "Check-out",
  "Guest",
  "Listing",
  "total price",
  "status",
];

export const listingHeader = [
  "Title",
  "Location",
  "Price per night",
  "guests",
  "type",
  "Actions",
];
