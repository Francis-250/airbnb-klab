import { Heart, Star, Phone, Navigation, BadgeCheck } from "lucide-react";
import type { Listing } from "../../types";
import { Link } from "react-router-dom";

export default function ListingCard({
  listing,
  type,
}: {
  listing: Listing;
  type: "grid" | "list";
}) {
  if (type === "list") {
    return (
      <div className="flex rounded-2xl overflow-hidden bg-white dark:bg-[#1e242d] mt-2">
        <Link
          to={`/listings/${listing.id}`}
          style={{
            backgroundImage: `url(${listing.image[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="relative w-[200px] shrink-0"
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex flex-col gap-1.5 p-2.5">
            <span className="self-start text-[11px] font-medium text-white bg-black/40 rounded px-2 py-0.5">
              ★ Featured
            </span>
            <span className="self-start text-[11px] font-medium text-white bg-black/40 rounded px-2 py-0.5">
              $100 off ${listing.price}: eblwc
            </span>
          </div>
        </Link>

        <div className="flex flex-col justify-between flex-1 p-4 min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Star className="w-3.5 h-3.5 fill-red-500 stroke-none" />
                  <span className="text-[13px] font-semibold text-red-500">
                    ({listing.rating})
                  </span>
                  <span className="text-[13px] text-red-500">
                    {listing.reviews?.toLocaleString() ?? "2,391"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                    {listing.title}
                  </h2>
                  <BadgeCheck className="w-4 h-4 text-green-500 fill-green-500 stroke-white" />
                </div>
              </div>
              <button className="shrink-0 mt-0.5">
                <Heart className="w-5 h-5 text-red-400" />
              </button>
            </div>

            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mt-2">
              {listing.description ??
                "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."}
            </p>
          </div>

          <div className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400">
              <Phone className="w-3.5 h-3.5" />
              {listing.phone ?? "(123) 456-7890"}
            </span>
            <span className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400">
              <Navigation className="w-3.5 h-3.5" />
              Directions
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-2">
      <Link
        to={`/listings/${listing.id}`}
        style={{
          backgroundImage: `url(${listing.image[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="relative rounded-[10px] overflow-hidden aspect-4/3 w-full"
      >
        <div className="absolute inset-0 bg-black/38" />
        <div className="relative z-10 flex items-center justify-between px-2.5 pt-2.5">
          <span className="text-[11px] font-medium tracking-wide text-white border border-white/30 bg-white/15 rounded-full px-2.5 py-0.5">
            Guest Favorite
          </span>
          <button className="w-7 h-7 flex items-center justify-center rounded-full border border-white/30 bg-white/15">
            <Heart className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </Link>
      <div className="pt-2.5 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <h2 className="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate">
            {listing.title}
          </h2>
          <span className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400 shrink-0">
            <Star className="w-3 h-3 fill-amber-400 stroke-none" />
            {listing.rating}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
            {listing.location}
          </span>
          <span className="text-[12px] font-medium text-gray-900 dark:text-gray-100 shrink-0">
            ${listing.price}
            <span className="font-normal text-gray-400">/night</span>
          </span>
        </div>
      </div>
    </div>
  );
}
