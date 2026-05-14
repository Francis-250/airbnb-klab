"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpLimiter = exports.forgotPasswordLimiter = exports.loginLimiter = exports.registerLimiter = exports.strictLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const isDevelopment = process.env.NODE_ENV !== "production";
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 1000 : 100,
    message: {
        success: false,
        message: "Too many requests, please try again later.",
        error: "Too many requests, please try again later.",
    },
});
exports.strictLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipFailedRequests: true,
    message: {
        success: false,
        message: "Too many delete requests, please try again later.",
        error: "Too many delete requests, please try again later.",
    },
});
exports.registerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: isDevelopment ? 50 : 5,
    message: {
        success: false,
        message: "Too many accounts created, try again in 1 hour.",
        error: "Too many accounts created, try again in 1 hour.",
    },
});
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 50 : 5,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: "Too many failed login attempts, try again in 15 minutes.",
        error: "Too many failed login attempts, try again in 15 minutes.",
    },
});
exports.forgotPasswordLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many reset requests, try again in 1 hour.",
        error: "Too many reset requests, try again in 1 hour.",
    },
});
exports.otpLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many OTP attempts, try again in 15 minutes.",
        error: "Too many OTP attempts, try again in 15 minutes.",
    },
});
