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

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  guest: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface ListingReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  guest: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface ListingCommentsResponse {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ConversationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface ConversationMessage {
  id: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface Conversation {
  id: string;
  guestId: string;
  hostId: string;
  listingId: string;
  guest: ConversationUser;
  host: ConversationUser;
  listing: {
    id: string;
    title: string;
    location: string;
    photos: string[];
    hostId: string;
  };
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  guest: {
    name: string;
    email: string;
    avatar?: string | null;
  };
  listing: {
    id: string;
    title: string;
    location: string;
    photos: string[];
    pricePerNight: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
