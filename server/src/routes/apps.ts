import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

export const appsRouter = Router();

appsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const apps = await prisma.app.findMany({
      where: category ? { category: String(category) } : undefined,
      orderBy: { name: "asc" },
    });
    res.json(apps);
  } catch (err) {
    console.error("Failed to fetch apps:", err);
    res.status(500).json({ error: { message: "Failed to fetch aapps" } });
  }
});
