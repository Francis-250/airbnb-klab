import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    interface CustomJwtPayload extends jwt.JwtPayload {
      userId: string;
      role: string;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    ) as CustomJwtPayload;

    req.user = decoded.userId;
    req.role = decoded.role;

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const isHost = (req: Request, res: Response, next: NextFunction) => {
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

export const isApprovedHost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ message: "You need to be authenticated" });
  }

  if (req.role !== "host") {
    return res
      .status(403)
      .json({ message: "Only hosts can perform this action" });
  }

  const host = await prisma.user.findUnique({
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

export const isGuest = (req: Request, res: Response, next: NextFunction) => {
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

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
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
