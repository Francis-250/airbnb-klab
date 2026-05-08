import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import Calendar from "../components/Calendar";
import { toast } from "sonner";

export default function BookingCalendar() {
  const { id } = useParams<{ id: string }>();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const handleDateSelect = (date: Date) => {
    if (!checkIn) {
      setCheckIn(date);
      setSelectedDates([date]);
    } else if (!checkOut && date > checkIn) {
      setCheckOut(date);
      const dates = [];
      const current = new Date(checkIn);
      while (current <= date) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      setSelectedDates(dates);
    } else {
      setCheckIn(date);
      setCheckOut(null);
      setSelectedDates([date]);
    }
  };

  const handleDateRemove = (date: Date) => {
    if (date.toDateString() === checkIn?.toDateString()) {
      setCheckIn(null);
      setCheckOut(null);
      setSelectedDates([]);
    } else if (date.toDateString() === checkOut?.toDateString()) {
      setCheckOut(null);
      const dates = [checkIn!];
      const current = new Date(checkIn!);
      current.setDate(current.getDate() + 1);
      while (current < date) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      setSelectedDates(dates);
    }
  };

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !listing) return 0;
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );
    return nights * listing.pricePerNight * guests;
  };

  const handleBooking = async () => {
    if (!checkIn || !checkOut || !listing) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    try {
      await api.post("/bookings", {
        listingId: listing.id,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
      });
      toast.success("Booking request sent successfully!");
      setCheckIn(null);
      setCheckOut(null);
      setSelectedDates([]);
    } catch {
      toast.error("Failed to create booking");
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!listing) {
    return <div className="p-6">Listing not found</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>
          <p className="text-gray-600 mb-6">{listing.location}</p>

          {listing.photos && listing.photos.length > 0 && (
            <div className="mb-6">
              <img
                src={listing.photos[0]}
                alt={listing.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <Calendar
            selectedDates={selectedDates}
            onDateSelect={handleDateSelect}
            onDateRemove={handleDateRemove}
          />
        </div>

        <div>
          <div className="bg-white p-6">
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Check-in
                </label>
                <div className="p-3 bg-gray-50">
                  {checkIn ? checkIn.toLocaleDateString() : "Select a date"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Check-out
                </label>
                <div className="p-3 bg-gray-50">
                  {checkOut ? checkOut.toLocaleDateString() : "Select a date"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>
                  ${listing.pricePerNight} x{" "}
                  {checkIn && checkOut
                    ? Math.ceil(
                        (checkOut.getTime() - checkIn.getTime()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : 0}{" "}
                  nights
                </span>
                <span>${calculateTotalPrice()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${calculateTotalPrice()}</span>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={!checkIn || !checkOut}
              className="w-full mt-6 bg-blue-500 text-white py-3 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
