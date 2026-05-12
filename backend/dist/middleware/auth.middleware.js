"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isGuest = exports.isApprovedHost = exports.isHost = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const verifyToken = (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : null;
    const token = req.cookies?.token || bearerToken;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded.userId;
        req.role = decoded.role;
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.verifyToken = verifyToken;
const isHost = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "You need to be authenticated" });
    }
    if (req.role !== "host") {
        return res
            .status(403)
            .json({ message: "Only hosts can perform this action" });
    }
    next();
};
exports.isHost = isHost;
const isApprovedHost = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "You need to be authenticated" });
    }
    if (req.role !== "host") {
        return res
            .status(403)
            .json({ message: "Only hosts can perform this action" });
    }
    const host = await prisma_1.default.user.findUnique({
        where: { id: req.user },
        select: { hostStatus: true },
    });
    if (!host || host.hostStatus !== "approved") {
        return res.status(403).json({
            message: "Your host account must be approved before performing this action",
        });
    }
    next();
};
exports.isApprovedHost = isApprovedHost;
const isGuest = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.role !== "guest") {
        return res
            .status(403)
            .json({ message: "Only guests can perform this action" });
    }
    next();
};
exports.isGuest = isGuest;
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.role !== "admin") {
        return res
            .status(403)
            .json({ message: "Only admins can perform this action" });
    }
    next();
};
exports.isAdmin = isAdmin;
