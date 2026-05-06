// components/ListingView.tsx
import { useEffect, useState } from "react";
import {
  X,
  MapPin,
  Users,
  Home,
  Wifi,
  Coffee,
  Car,
  PawPrint,
  Star,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Listing } from "../../types";

interface ListingViewProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ListingView({
  listing,
  isOpen,
  onClose,
}: ListingViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!listing || !isOpen) return null;

  const nextImage = () => {
    if (listing.photos && listing.photos.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.photos.length);
    }
  };

  const prevImage = () => {
    if (listing.photos && listing.photos.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? listing.photos.length - 1 : prev - 1,
      );
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes("wifi")) return Wifi;
    if (amenityLower.includes("kitchen")) return Coffee;
    if (amenityLower.includes("parking")) return Car;
    if (amenityLower.includes("pet")) return PawPrint;
    return Home;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-5xl bg-white dark:bg-[#111828] rounded-xl shadow-2xl overflow-hidden">
          {/* Header Actions */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button
              onClick={onClose}
              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Image Gallery */}
          <div className="relative h-64 sm:h-80 md:h-96 bg-gray-100 dark:bg-gray-900">
            {listing.photos && listing.photos.length > 0 ? (
              <>
                <img
                  src={listing.photos[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />

                {listing.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-800 dark:text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-800 dark:text-white" />
                    </button>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {listing.photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-1.5 rounded-full transition-all ${
                            currentImageIndex === index
                              ? "w-6 bg-white"
                              : "w-1.5 bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[60vh]">
            <div className="p-5 md:p-6">
              {/* Title and Price Row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                    {listing.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                    {listing.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                        <span>{listing.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{listing.location}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${listing.pricePerNight}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    per night
                  </p>
                </div>
              </div>

              {/* Host Info */}
              <div className="flex items-center gap-3 py-4 border-t border-b border-gray-200 dark:border-gray-700 mb-5">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hosted by
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {listing.host?.name || "Anonymous Host"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2.5 text-sm">
                  <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Guests
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing.guests}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Home className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Type
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {listing.type.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {listing.amenities && listing.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Amenities
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {listing.amenities.slice(0, 6).map((amenity, index) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                    {listing.amenities.length > 6 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        +{listing.amenities.length - 6} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                  Reserve
                </button>
                <button className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Contact Host
                </button>
              </div>

              {/* Footer Info */}
              <div className="mt-4 pt-3 text-center text-xs text-gray-400 dark:text-gray-500">
                <p>Listing ID: {listing.id.slice(0, 8)}...</p>
                <p className="mt-0.5">
                  Listed on {new Date(listing.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
