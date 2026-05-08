import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { Calendar, MapPin, DollarSign, User, Clock } from "lucide-react";

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
    pricePerNight: number;
  };
  guest: {
    name: string;
  };
}

export default function Bookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">(
    "upcoming",
  );

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["guest-bookings", activeTab],
    queryFn: async () => {
      const response = await api.get(`/bookings?status=${activeTab}`);
      return response.data;
    },
    enabled: !!user,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await api.delete(`/bookings/${bookingId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Booking cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["guest-bookings"] });
    },
    onError: () => {
      toast.error("Failed to cancel booking");
    },
  });

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return nights;
  };

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Please log in</h2>
          <p className="text-gray-600">
            You need to be logged in to view your bookings
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-6">Loading bookings...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      <div className="bg-white mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 font-medium ${
              activeTab === "upcoming"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-3 font-medium ${
              activeTab === "past"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-6 py-3 font-medium ${
              activeTab === "cancelled"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {bookings?.data?.length === 0 ? (
        <div className="bg-white p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            No {activeTab} bookings
          </h2>
          <p className="text-gray-600">
            {activeTab === "upcoming" &&
              "Start exploring and book your next stay"}
            {activeTab === "past" && "Your past bookings will appear here"}
            {activeTab === "cancelled" &&
              "Your cancelled bookings will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings?.data?.map((booking: Booking) => (
            <div key={booking.id} className="bg-white overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 h-48">
                  {booking.listing.photos &&
                  booking.listing.photos.length > 0 ? (
                    <img
                      src={booking.listing.photos[0]}
                      alt={booking.listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {booking.listing.title}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {booking.listing.location}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-4">
                        <User className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          Guest: {booking.guest.name}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Check-in</p>
                        <p className="font-medium">
                          {formatDate(booking.checkIn)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Check-out</p>
                        <p className="font-medium">
                          {formatDate(booking.checkOut)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium">
                          {calculateNights(booking.checkIn, booking.checkOut)}{" "}
                          nights
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1 text-gray-600" />
                      <span className="text-lg font-semibold">
                        ${booking.totalPrice}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`/listings/${booking.listing.id}`}
                        className="px-4 py-2 bg-blue-500 text-white"
                      >
                        View Listing
                      </a>
                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-4 py-2 bg-red-500 text-white"
                          disabled={cancelBookingMutation.isPending}
                        >
                          {cancelBookingMutation.isPending
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
