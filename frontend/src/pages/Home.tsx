import { Link } from "react-router-dom";
import Hero from "../components/section/Hero";
import { useLocation } from "../hooks/useLocation";
import { ArrowRight } from "lucide-react";
import ListingCard from "../components/card/ListingCard";
import { api } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Listing } from "../types";

const getListing = async () => {
  const res = await api.get("/listings");
  return res.data;
};

export default function Home() {
  const {
    data: listings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listing"],
    queryFn: getListing,
  });
  const { location } = useLocation();

  if (error) return <span>{error.message}</span>;

  return (
    <div className="pb-10">
      <Hero />

      <div className="mt-10 mb-5 flex items-center justify-between">
        <div>
          <h2
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-xl font-semibold text-[#111] dark:text-white"
          >
            Popular homes in{" "}
            <span className="text-(--color-primary)">
              {isLoading ? "..." : location}
            </span>
          </h2>
          <p className="text-[13px] text-[#AAAAAA] mt-0.5">
            Handpicked stays near you
          </p>
        </div>
        <Link
          to={`/all-listings?location=${location}`}
          className="flex items-center gap-1.5 text-[13px] font-medium text-(--color-primary) hover:underline"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
        {isLoading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="aspect-4/3 rounded-xl bg-[#EBEBEB] dark:bg-[#2A2A2A] animate-pulse"
              />
            ))
          : listings?.map((listing: Listing) => (
              <ListingCard key={listing.id} listing={listing} type="grid" />
            ))}
      </div>
    </div>
  );
}
