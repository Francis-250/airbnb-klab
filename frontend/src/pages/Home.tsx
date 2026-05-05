import { Link } from "react-router-dom";
import Hero from "../components/section/Hero";
import { useLocation } from "../hooks/useLocation";
import { ArrowRight } from "lucide-react";
import { listings } from "../data/listings";
import ListingCard from "../components/card/ListingCard";

export default function Home() {
  const { location, loading } = useLocation();

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
            {loading ? "..." : location}{" "}
            <ArrowRight className="w-4 h-4 hover:text-(--color-primary)" />
          </Link>
        </h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} type="grid" />
        ))}
      </div>
    </div>
  );
}
