import rateLimit from "express-rate-limit";

const isDevelopment = process.env.NODE_ENV !== "production";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
    error: "Too many requests, please try again later.",
  },
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipFailedRequests: true,
  message: {
    success: false,
    message: "Too many delete requests, please try again later.",
    error: "Too many delete requests, please try again later.",
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDevelopment ? 50 : 5,
  message: {
    success: false,
    message: "Too many accounts created, try again in 1 hour.",
    error: "Too many accounts created, try again in 1 hour.",
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 50 : 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many failed login attempts, try again in 15 minutes.",
    error: "Too many failed login attempts, try again in 15 minutes.",
  },
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many reset requests, try again in 1 hour.",
    error: "Too many reset requests, try again in 1 hour.",
  },
});

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many OTP attempts, try again in 15 minutes.",
    error: "Too many OTP attempts, try again in 15 minutes.",
  },
});
