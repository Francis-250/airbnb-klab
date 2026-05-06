export interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: ListingType;
  amenities: string[];
  photos: string[];
  rating?: number;
  hostId: string;
  host: UserProps;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProps {
  id: string;
  email?: string | null;
  name: string | null;
  avatar?: string | null;
  phone?: string | null;
}

export interface CategoryProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
}

export type ListingType = "apartment" | "house" | "villa" | "cabin";
