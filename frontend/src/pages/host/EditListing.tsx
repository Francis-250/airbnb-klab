import Spinner from "../../components/Spinner";
import { useParams } from "react-router-dom";
import { useListing } from "../../hooks/useListings";
import AddListing from "./AddListing";

export default function EditListing() {
  const { id } = useParams();
  const { data: listing, isLoading, error, isFetching } = useListing(id!);

  if (isLoading || isFetching) return <Spinner />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Error loading listing details: {error.message}
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="rounded-2xl border border-[#DDE2EA] bg-white p-6 text-sm text-[#667085]">
        Listing not found.
      </div>
    );
  }

  return <AddListing mode="edit" listing={listing} />;
}
