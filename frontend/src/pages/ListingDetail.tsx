import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Share2,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import type { Listing } from "../types";
import Spinner from "../components/Spinner";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data.listing);
        if (res.data.listing.photos && res.data.listing.photos.length > 0) {
          setMainImage(res.data.listing.photos[0]);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        setError("Failed to load listing. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchListing();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );

  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  if (!listing)
    return <div className="text-center mt-10">Listing not found</div>;

  const allImages = listing.photos?.slice(0, 4) || [];
  if (allImages.length < 4) {
    for (let i = allImages.length; i < 4; i++) {
      allImages.push("/placeholder.svg");
    }
  }

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAP_API_KEY}&q=${encodeURIComponent(listing.location)}`;

  const prevSlide = () =>
    setSliderIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const nextSlide = () =>
    setSliderIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-10"
    >
      <header className="flex justify-between items-start mb-5 gap-4">
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-lg sm:text-2xl font-semibold leading-snug"
        >
          {listing.title} · {listing.location}
        </motion.h1>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 shrink-0"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsShared(!isShared)}
            className="flex items-center gap-1.5 bg-transparent border-none text-sm font-medium underline cursor-pointer hover:text-(--color-primary)"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSaved(!isSaved)}
            className="flex items-center gap-1.5 bg-transparent border-none text-sm font-medium underline cursor-pointer hover:text-(--color-primary)"
          >
            <motion.div
              animate={{ scale: isSaved ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isSaved ? "fill-(--color-primary) text-(--color-primary)" : ""
                }`}
              />
            </motion.div>
            <span className="hidden sm:inline">Save</span>
          </motion.button>
        </motion.div>
      </header>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden mb-9"
      >
        {" "}
        <div className="block sm:hidden relative h-72 rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={sliderIndex}
              src={allImages[sliderIndex]}
              alt={listing.title}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center shadow"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center shadow"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setSliderIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === sliderIndex ? "bg-white w-3" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="hidden sm:grid grid-cols-5 gap-1.5 h-80 lg:h-120">
          <motion.img
            key={mainImage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            src={mainImage}
            alt={listing.title}
            className="col-span-3 w-full h-full object-cover cursor-pointer"
            onClick={() => {
              const currentIndex = allImages.indexOf(mainImage);
              const nextIndex = (currentIndex + 1) % allImages.length;
              setMainImage(allImages[nextIndex]);
            }}
          />
          <div className="col-span-2 grid grid-rows-2 gap-1.5">
            <motion.img
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              src={listing.photos[1]}
              alt={listing.title}
              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setMainImage(listing.photos[1])}
            />
            <div className="grid grid-cols-2 gap-1.5">
              <motion.img
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                src={listing.photos[2]}
                alt={listing.title}
                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setMainImage(listing.photos[2])}
              />
              <motion.img
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                src={listing.photos[3]}
                alt={listing.title}
                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setMainImage(listing.photos[3])}
              />
            </div>
          </div>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-16 items-start">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-lg sm:text-xl font-semibold mb-4"
          >
            {listing.title} in {listing.location}
          </motion.h2>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={listing.host?.avatar || "/default-avatar.png"}
              alt={listing.host?.name || "Host"}
              className="w-11 h-11 rounded-full object-cover bg-[#EBEBEB]"
            />
            <div>
              <p className="text-sm font-semibold">
                Hosted by {listing.host?.name}
              </p>
              <p className="text-sm text-[#717171]">{listing.host?.phone}</p>
            </div>
          </motion.div>

          <div className="h-px bg-[#EBEBEB] dark:bg-[#333] my-6" />

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-[15px] leading-7 text-[#333] dark:text-[#CCC]"
          >
            {listing.description}
          </motion.p>

          <div className="h-px bg-[#EBEBEB] dark:bg-[#333] my-6" />
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <h3
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-lg font-semibold mb-4"
            >
              Location
            </h3>
            <div className="mb-6 rounded-xl overflow-hidden h-56 sm:h-64 bg-[#EBEBEB] dark:bg-[#333]">
              <iframe
                title="Property Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={mapUrl}
              />
            </div>
            <motion.a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 2 }}
              className="flex items-center gap-2 text-sm text-(--color-primary) hover:underline mb-6"
            >
              <MapPin className="w-4 h-4" />
              Get directions
            </motion.a>
          </motion.div>

          <div className="h-px bg-[#EBEBEB] dark:bg-[#333] my-6" />
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <h3
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-lg font-semibold mb-4"
            >
              What this place offers
            </h3>
            <div className="flex items-center gap-2 text-sm text-[#717171] mb-4">
              <Users className="w-4 h-4" />
              <span>Up to {listing.guests} guests</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnimatePresence>
                {listing.amenities?.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.3 + i * 0.05 }}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-(--color-primary) shrink-0" />
                    {a}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ x: 30, opacity: 0, y: 20 }}
          animate={{ x: 0, opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          className="rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] p-7 lg:sticky lg:top-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="flex items-baseline gap-1.5 mb-5"
          >
            <span
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-2xl font-semibold"
            >
              ${listing.pricePerNight}
            </span>
            <span className="text-sm text-[#717171]">per night</span>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-2 text-sm rounded-lg px-3 py-2.5 mb-5"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className={`w-2 h-2 rounded-full shrink-0 ${
                listing?.hostId ? "bg-green-500" : "bg-(--color-primary)"
              }`}
            />
            {listing?.hostId
              ? "Available for booking"
              : "Rare find! This place is usually booked"}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/bookings/${id}`)}
            className="w-full bg-(--color-primary) text-white py-3.5 rounded-xl text-[15px] font-semibold tracking-wide hover:opacity-90 transition-opacity"
          >
            Book Now
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-xs text-[#717171] mt-2.5"
          >
            You won't be charged yet
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
