export interface Listing {
  id: number;
  title: string;
  location: string;
  price: number;
  rating: number;
  superhost: boolean;
  available: boolean;
  image: string[];
  reviews?: string;
  description?: string;
  phone?: string;
  amenities?: string[];
  guests?: number;
  host?: UserProps;
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
