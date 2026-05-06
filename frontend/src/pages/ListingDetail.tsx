import { useParams } from "react-router-dom";
import { listings } from "../data/listings";
import { Heart, Share2, Users, MapPin } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const listing = listings.find((l) => l.id === Number(id));
  const [mainImage, setMainImage] = useState(listing?.image[0] || "");
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);

  if (!listing) return null;

  const allImages = [
    listing.image[0],
    listing.image[1],
    listing.image[2],
    listing.image[3],
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <header className="flex justify-between items-start mb-5 gap-4">
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-lg sm:text-xl md:text-2xl font-semibold leading-snug max-w-xl"
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
        className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 rounded-2xl overflow-hidden mb-9 h-64 sm:h-80 md:h-120"
      >
        <motion.img
          key={mainImage}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          src={mainImage}
          alt={listing.title}
          className="col-span-1 sm:col-span-3 w-full h-full object-cover cursor-pointer"
          onClick={() => {
            const currentIndex = allImages.indexOf(mainImage);
            const nextIndex = (currentIndex + 1) % allImages.length;
            setMainImage(allImages[nextIndex]);
          }}
        />
        <div className="hidden sm:grid col-span-2 grid-rows-2 gap-1.5">
          <motion.img
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            src={listing.image[1]}
            alt={listing.title}
            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setMainImage(listing.image[1])}
          />
          <div className="grid grid-cols-2 gap-1.5">
            <motion.img
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              src={listing.image[2]}
              alt={listing.title}
              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setMainImage(listing.image[2])}
            />
            <motion.img
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              src={listing.image[3]}
              alt={listing.title}
              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setMainImage(listing.image[3])}
            />
          </div>
        </div>

        <div className="flex sm:hidden gap-1.5 overflow-x-auto">
          {allImages.slice(1).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={listing.title}
              className="h-16 w-24 shrink-0 object-cover rounded-lg cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              onClick={() => setMainImage(img)}
            />
          ))}
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
            className="text-lg md:text-xl font-semibold mb-4"
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
              src={listing.host?.image || "/default-avatar.png"}
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

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.7 }}
            className="h-px bg-[#EBEBEB] dark:bg-[#333] my-6"
          />

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-[15px] leading-7 text-[#333]"
          >
            {listing.description}
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9 }}
            className="h-px bg-[#EBEBEB] dark:bg-[#333] my-6"
          />

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

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
              className="mb-6 rounded-xl overflow-hidden h-48 sm:h-64 bg-[#EBEBEB] dark:bg-[#333]"
            >
              <iframe
                title="Property Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(listing.location)}`}
              />
            </motion.div>

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

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2 }}
            className="h-px bg-[#EBEBEB] dark:bg-[#333] my-6"
          />

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
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.3 + i * 0.05 }}
                      className="w-1.5 h-1.5 rounded-full bg-(--color-primary) shrink-0"
                    />
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
          className="rounded-2xl p-5 sm:p-7 lg:sticky lg:top-6 border border-[#EBEBEB] dark:border-[#333]"
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
              ${listing.price}
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
                listing.available ? "bg-green-500" : "bg-(--color-primary)"
              }`}
            />
            {listing.available
              ? "Available for booking"
              : "Rare find! This place is usually booked"}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
