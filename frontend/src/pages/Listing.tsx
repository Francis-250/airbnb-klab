import { useSearchParams } from "react-router-dom";

export default function Listing() {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");

  return <div>Listing {location}</div>;
}
