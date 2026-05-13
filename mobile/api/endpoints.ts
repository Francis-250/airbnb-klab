export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
    CHANGE_PASSWORD: "/auth/change-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_OTP: "/auth/verify-otp",
    AVATAR: "/auth/avatar",
    UPDATE_PROFILE: "/auth/update-profile",
  },

  LISTING: {
    MY_LISTINGS: "/listings/me",
    LISTINGS: "/listings",
    SEARCH: "/listings/search",
    STATS: "/listings/stats",
    LISTING_BY_ID: "/listings/:id",
    CREATE: "/listings",
    UPDATE: "/listings/:id",
    DELETE: "/listings/:id",
  },

  USERS: {
    ALL: "/users",
    HOSTS: "/users/hosts",
    HOST_STATUS: "/users/hosts/:id/status",
    FAVORITES: "/users/favorites",
    FAVORITE_BY_ID: "/users/favorites/:listingId",
    BY_ID: "/users/:id",
    UPDATE: "/users/:id",
    DELETE: "/users/:id",
  },

  BOOKINGS: {
    ALL: "/bookings",
    BY_ID: "/bookings/:id",
    CREATE: "/bookings",
    UPDATE_STATUS: "/bookings/:id/status",
    DELETE: "/bookings/:id",
  },

  STATS: {
    USERS: "/stats/users",
    DASHBOARD: "/stats/dashboard",
  },

  AI: {
    SEARCH: "/ai/search",
    GENERATE_DESCRIPTION: "/ai/listings/:id/generate-description",
    CHAT: "/ai/chat",
    RECOMMEND: "/ai/recommend",
    REVIEW_SUMMARY: "/ai/listings/:id/review-summary",
  },

  REVIEWS: {
    CREATE: "/reviews",
    BY_LISTING: "/reviews/listing/:id",
    UPDATE: "/reviews/:id",
    DELETE: "/reviews/:id",
  },

  CONVERSATIONS: {
    CREATE_OR_GET: "/conversations",
    ALL: "/conversations",
    MESSAGES: "/conversations/:id/messages",
    SEND_MESSAGE: "/conversations/:id/messages",
  },

  COMMENTS: {
    BY_LISTING: "/comments/listing/:id",
    CREATE: "/comments",
    DELETE: "/comments/:id",
  },
};
