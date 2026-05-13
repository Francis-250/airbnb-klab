import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { Booking, PaginatedResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      listingId: string;
      checkIn: string;
      checkOut: string;
    }) => {
      const response = await api.post<Booking>(ENDPOINTS.BOOKINGS.CREATE, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};
