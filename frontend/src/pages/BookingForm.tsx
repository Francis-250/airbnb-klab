import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { Calendar, Users, DollarSign, MapPin, Check } from "lucide-react";

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
      return response.data;
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
      toast.success("Booking created successfully!");
      navigate("/bookings");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to create booking");
    },
  });

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

    createBookingMutation.mutate({
      listingId: id,
      checkIn,
      checkOut,
    });
  };

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !listing) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    return nights * listing.pricePerNight;
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Please log in to book</h2>
          <p className="text-gray-600 mb-4">
            You need to be logged in to make a booking
          </p>
          <button
            onClick={() => navigate(`/login?redirect=/bookings/${id}`)}
            className="px-6 py-2 bg-blue-500 text-white"
          >
            Login to Book
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-6">Loading listing...</div>;
  }

  if (!listing) {
    return <div className="p-6">Listing not found</div>;
  }

  const totalPrice = calculateTotalPrice();
  const nights = calculateNights();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-6">Book Your Stay</h1>

          <div className="bg-white p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{listing.title}</h2>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="w-4 h-4" />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{listing.guests} guests</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>${listing.pricePerNight}/night</span>
              </div>
            </div>
            <p className="text-gray-600">{listing.description}</p>
          </div>

          <div className="bg-white p-6">
            <h3 className="text-lg font-semibold mb-4">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {listing.amenities?.map((amenity: string) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="bg-white p-6">
            <h2 className="text-xl font-semibold mb-6">Booking Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-3 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  className="w-full p-3 bg-gray-50"
                  required
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    ${listing.pricePerNight} x {nights} nights
                  </span>
                  <span>${listing.pricePerNight * nights}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white font-medium"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending
                  ? "Creating Booking..."
                  : "Confirm Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
