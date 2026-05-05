import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { getCache, setCache } from "../lib/cache";

export const getUserStats = async (req: Request, res: Response) => {
  const cacheKey = "users:stats";
  const cached = getCache(cacheKey);
  if (cached) return res.status(200).json(cached);

  try {
    const [totalUsers, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    ]);

    const response = { totalUsers, byRole };
    setCache(cacheKey, response, 300);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
