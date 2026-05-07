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
    <div>
      <Hero />
      <div className="mt-2">
        <h1 className="flex gap-1 font-bold">
          Popular homes in
          <Link
            to={`/all-listings?location=${location}`}
            className="flex gap-1 items-center"
          >
            {isLoading ? "..." : location}{" "}
            <ArrowRight className="w-4 h-4 hover:text-(--color-primary)" />
          </Link>
        </h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {listings &&
          listings.map((listing: Listing) => (
            <ListingCard key={listing.id} listing={listing} type="grid" />
          ))}
      </div>
    </div>
  );
}
