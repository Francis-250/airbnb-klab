import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_API_URL ||
    "http://localhost:4000/api",
  withCredentials: true,
});
