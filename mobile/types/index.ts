export interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  status: ListingStatus;
  type: ListingType;
  amenities: string[];
  photos: string[];
  rating?: number;
  hostId: string;
  host: Host;
  createdAt: Date;
  updatedAt: Date;
}

export interface Host {
  name: string;
  email: string;
  avatar?: string | null;
}

export type ListingType = "apartment" | "house" | "villa" | "cabin";
export type ListingStatus = "available" | "booked" | "unavailable";

export type AIFilters = {
  location: string | null;
  type: ListingType | null;
  minPrice: number | null;
  maxPrice: number | null;
  guests: number | null;
};

export type AISearchResponse = {
  filters: AIFilters;
  data: Listing[];
  message?: string;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
