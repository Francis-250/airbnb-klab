import { useParams } from "react-router-dom";
import { listings } from "../data/listings";
import { Heart, Share2, Users } from "lucide-react";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const listing = listings.find((l) => l.id === Number(id));

  return (
    <div className="min-h-screen">
      <header className="flex justify-between items-start mb-5">
        <h1
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-2xl font-semibold leading-snug max-w-xl"
        >
          {listing?.title} · {listing?.location}
        </h1>
        <div className="flex gap-4">
          <button className="flex items-center gap-1.5 bg-transparent border-none text-sm font-medium underline cursor-pointer hover:text-(--color-primary)">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-1.5 bg-transparent border-none text-sm font-medium underline cursor-pointer hover:text-(--color-primary)">
            <Heart className="w-4 h-4" />
            Save
          </button>
        </div>
      </header>
      <div className="grid grid-cols-5 gap-1.5 rounded-2xl overflow-hidden mb-9 h-120">
        <img
          src={listing?.image[0]}
          alt={listing?.title}
          className="col-span-3 w-full h-full object-cover"
        />
        <div className="col-span-2 grid grid-rows-2 gap-1.5">
          <img
            src={listing?.image[1]}
            alt={listing?.title}
            className="w-full h-full object-cover"
          />
          <div className="grid grid-cols-2 gap-1.5">
            <img
              src={listing?.image[2]}
              alt={listing?.title}
              className="w-full h-full object-cover"
            />
            <img
              src={listing?.image[3]}
              alt={listing?.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_340px] gap-16 items-start">
        <div>
          <h2
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-xl font-semibold mb-4"
          >
            {listing?.title} in {listing?.location}
          </h2>

          <div className="flex items-center gap-3 mb-6">
            <img
              src={listing?.host?.image || "/default-avatar.png"}
              alt={listing?.host?.name || "Host"}
              className="w-11 h-11 rounded-full object-cover bg-[#EBEBEB]"
            />
            <div>
              <p className="text-sm font-semibold">
                Hosted by {listing?.host?.name}
              </p>
              <p className="text-sm text-[#717171]">{listing?.host?.phone}</p>
            </div>
          </div>

          <div className="h-px bg-[#EBEBEB] my-6" />
          <p className="text-[15px] leading-7 text-[#333]">
            {listing?.description}
          </p>

          <div className="h-px bg-[#EBEBEB] my-6" />
          <div>
            <h3
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-lg font-semibold mb-4"
            >
              What this place offers
            </h3>

            <div className="flex items-center gap-2 text-sm text-[#717171] mb-4">
              <Users className="w-4 h-4" />
              <span>Up to {listing?.guests} guests</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {listing?.amenities?.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-(--color-primary) shrink-0" />
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-7 sticky top-6">
          <div className="flex items-baseline gap-1.5 mb-5">
            <span
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-2xl font-semibold"
            >
              ${listing?.price}
            </span>
            <span className="text-sm text-[#717171]">per night</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#717171] bg-[#F7F7F7] rounded-lg px-3 py-2.5 mb-5">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                listing?.available ? "bg-green-500" : "bg-(--color-primary)"
              }`}
            />
            {listing?.available
              ? "Available for booking"
              : "Rare find! This place is usually booked"}
          </div>

          <button className="w-full bg-(--color-primary) text-white py-3.5 rounded-xl text-[15px] font-semibold tracking-wide hover:opacity-90 transition-opacity">
            Book Now
          </button>

          <p className="text-center text-xs text-[#717171] mt-2.5">
            You won't be charged yet
          </p>
        </div>
      </div>
    </div>
  );
}
