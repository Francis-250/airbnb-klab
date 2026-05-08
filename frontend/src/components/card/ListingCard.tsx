import { Heart, Star, Phone, Navigation, BadgeCheck } from "lucide-react";
import type { Listing } from "../../types";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

export default function ListingCard({
  listing,
  type,
}: {
  listing: Listing;
  type: "grid" | "list";
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      try {
        await api.post(`/users/favorites/${listingId}`);
        return { action: "added", message: "Added to favorites" };
      } catch (error: any) {
        if (error.response?.status === 400 || error.response?.status === 409) {
          await api.delete(`/users/favorites/${listingId}`);
          return { action: "removed", message: "Removed from favorites" };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      setIsLiked(data.action === "added");
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update favorites",
      );
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to add favorites");
      return;
    }
    toggleFavoriteMutation.mutate(listing.id);
  };

  if (type === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="flex rounded-2xl overflow-hidden bg-white dark:bg-[#1e242d] mt-2"
      >
        <Link
          to={`/listings/${listing.id}`}
          style={{
            backgroundImage: `url(${listing.photos[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="relative w-50 shrink-0 overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.3 }}
            className="absolute inset-0 bg-black/20"
          />
          <div className="relative z-10 flex flex-col gap-1.5 p-2.5">
            <motion.span
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="self-start text-[11px] font-medium text-white bg-black/40 rounded px-2 py-0.5"
            >
              ★ Featured
            </motion.span>
            <motion.span
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="self-start text-[11px] font-medium text-white bg-black/40 rounded px-2 py-0.5"
            >
              $100 off ${listing.pricePerNight}: eblwc
            </motion.span>
          </div>
        </Link>

        <div className="flex flex-col justify-between flex-1 p-4 min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-1.5 mb-0.5"
                >
                  <Star className="w-3.5 h-3.5 fill-red-500 stroke-none" />
                  <span className="text-[13px] font-semibold text-red-500">
                    ({listing.rating})
                  </span>
                  <span className="text-[13px] text-red-500">
                    {listing.reviews?.toLocaleString() ?? "2,391"}
                  </span>
                </motion.div>
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-1.5"
                >
                  <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                    {listing.title}
                  </h2>
                  <BadgeCheck className="w-4 h-4 text-green-500 fill-green-500 stroke-white" />
                </motion.div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleFavorite}
                className="shrink-0 mt-0.5"
              >
                <motion.div
                  animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isLiked ? "fill-red-500 text-red-500" : "text-red-400"
                    }`}
                  />
                </motion.div>
              </motion.button>
            </div>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mt-2"
            >
              {listing.description ??
                "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."}
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700"
          >
            <motion.span
              whileHover={{ x: 2 }}
              className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400"
            >
              <Phone className="w-3.5 h-3.5" />
              {listing.host.phone ?? "(123) 456-7890"}
            </motion.span>
            <motion.span
              whileHover={{ x: 2 }}
              className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400"
            >
              <Navigation className="w-3.5 h-3.5" />
              Directions
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col mt-2"
    >
      <Link
        to={`/listings/${listing.id}`}
        style={{
          backgroundImage: `url(${listing.photos[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="relative rounded-[10px] overflow-hidden aspect-4/3 w-full"
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.5 }}
          className="absolute inset-0 bg-black/38"
        />
        <div className="relative z-10 flex items-center justify-between px-2.5 pt-2.5">
          <motion.span
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[11px] font-medium tracking-wide text-white border border-white/30 bg-white/15 rounded-full px-2.5 py-0.5"
          >
            Guest Favorite
          </motion.span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleFavorite}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-white/30 bg-white/15"
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  isLiked ? "fill-red-500 text-red-500" : "text-white"
                }`}
              />
            </motion.div>
          </motion.button>
        </div>
      </Link>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="pt-2.5 min-w-0"
      >
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
            ${listing.pricePerNight}
            <span className="font-normal text-gray-400">/night</span>
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
