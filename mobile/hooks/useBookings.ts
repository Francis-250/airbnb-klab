import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { Booking, PaginatedResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useBookings = (status?: "upcoming" | "past" | "cancelled") => {
  return useQuery<PaginatedResponse<Booking>>({
    queryKey: ["bookings", status ?? "all"],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Booking>>(
        ENDPOINTS.BOOKINGS.ALL,
        {
          params: status ? { status } : undefined,
        },
      );
      return response.data;
    },
  });
};
