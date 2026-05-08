import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import {
  Users,
  MapPin,
  Check,
  Star,
  ArrowLeft,
} from "lucide-react";

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

    createBookingMutation.mutate({ listingId: id, checkIn, checkOut });
  };

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !listing) return 0;
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return nights * listing.pricePerNight;
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24),
    );
  };

  const airbnbStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Circular+Std:wght@400;500;600;700&display=swap');
    .airbnb-font { font-family: 'Circular Std', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .date-input {
      width: 100%;
      padding: 14px 16px;
      border: 1.5px solid #DDDDDD;
      border-radius: 12px;
      font-size: 14px;
      color: #222;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      background: #fff;
      font-family: inherit;
    }
    .date-input:focus {
      border-color: #222;
      box-shadow: 0 0 0 2px rgba(34,34,34,0.08);
    }
    .book-btn {
      width: 100%;
      padding: 16px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      color: white;
      background: linear-gradient(135deg, #FF385C 0%, #E31C5F 100%);
      border: none;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }
    .book-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
    .book-btn:active:not(:disabled) { transform: translateY(0); }
    .book-btn:disabled { background: #DDDDDD; cursor: not-allowed; }
  `;

  if (!user) {
    return (
      <>
        <style>{airbnbStyles}</style>
        <div className="airbnb-font min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-[#FFF0F2] flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🏠</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#222] mb-3">
              Log in to continue
            </h2>
            <p className="text-[#717171] mb-6">
              You need to be logged in to make a booking.
            </p>
            <button
              onClick={() => navigate(`/login?redirect=/bookings/${id}`)}
              className="book-btn"
            >
              Continue with login
            </button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <style>{airbnbStyles}</style>
        <div className="airbnb-font min-h-screen bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-8 w-48 bg-[#EBEBEB] rounded-lg animate-pulse" />
                <div className="h-48 bg-[#EBEBEB] rounded-2xl animate-pulse" />
                <div className="h-32 bg-[#EBEBEB] rounded-2xl animate-pulse" />
              </div>
              <div className="h-80 bg-[#EBEBEB] rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <style>{airbnbStyles}</style>
        <div className="airbnb-font p-6 text-center text-[#717171]">
          Listing not found
        </div>
      </>
    );
  }

  const totalPrice = calculateTotalPrice();
  const nights = calculateNights();

  return (
    <>
      <style>{airbnbStyles}</style>
      <div className="airbnb-font min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-[#222] hover:text-[#FF385C] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to listing
          </button>

          <h1 className="text-3xl font-semibold text-[#222] mb-8">
            Confirm and pay
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12">
            {/* Left: Listing info + form */}
            <div>
              {/* Listing summary */}
              <div className="flex gap-4 pb-8 border-b border-[#EBEBEB]">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-[#F7F7F7]">
                  {listing.photos?.[0] ? (
                    <img
                      src={listing.photos[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#AAAAAA] text-2xl">
                      🏠
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#717171] font-medium uppercase tracking-wide mb-1">
                    {listing.type}
                  </p>
                  <h2 className="text-base font-semibold text-[#222] truncate mb-1">
                    {listing.title}
                  </h2>
                  <div className="flex items-center gap-1 text-sm text-[#717171]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm text-[#717171]">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{listing.guests} guests</span>
                    </div>
                    {listing.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#222] text-[#222]" />
                        <span className="font-medium text-[#222]">
                          {listing.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date selection */}
              <div className="py-8 border-b border-[#EBEBEB]">
                <h3 className="text-xl font-semibold text-[#222] mb-6">
                  Your trip
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#222] uppercase tracking-wide mb-2">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="date-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#222] uppercase tracking-wide mb-2">
                      Checkout
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      className="date-input"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {listing.amenities?.length > 0 && (
                <div className="py-8">
                  <h3 className="text-xl font-semibold text-[#222] mb-5">
                    What this place offers
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {listing.amenities.map((amenity: string) => (
                      <div key={amenity} className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "#ECFDF5" }}
                        >
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-[#222]">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Booking widget */}
            <div>
              <div
                className="sticky top-6 rounded-2xl border border-[#DDDDDD] p-6"
                style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}
              >
                {/* Price header */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-2xl font-semibold text-[#222]">
                    ${listing.pricePerNight}
                  </span>
                  <span className="text-[#717171] text-base">/ night</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 border border-[#DDDDDD] rounded-xl overflow-hidden">
                    <div className="p-3 border-r border-[#DDDDDD]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#222] mb-1">
                        Check-in
                      </p>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full text-sm text-[#222] outline-none bg-transparent"
                        required
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#222] mb-1">
                        Checkout
                      </p>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split("T")[0]}
                        className="w-full text-sm text-[#222] outline-none bg-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Price breakdown */}
                  {nights > 0 && (
                    <div className="pt-4 space-y-3">
                      <div className="flex justify-between text-sm text-[#222]">
                        <span className="underline">
                          ${listing.pricePerNight} × {nights}{" "}
                          {nights === 1 ? "night" : "nights"}
                        </span>
                        <span>${listing.pricePerNight * nights}</span>
                      </div>
                      <div className="pt-4 border-t border-[#DDDDDD] flex justify-between font-semibold text-[#222]">
                        <span>Total before taxes</span>
                        <span>${totalPrice}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="book-btn"
                    disabled={createBookingMutation.isPending}
                  >
                    {createBookingMutation.isPending ? "Reserving…" : "Reserve"}
                  </button>

                  <p className="text-center text-xs text-[#717171]">
                    You won't be charged yet
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
