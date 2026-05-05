import { useSearchParams } from "react-router-dom";

export default function Search() {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");

  return <div>Search for {location}</div>;
}
