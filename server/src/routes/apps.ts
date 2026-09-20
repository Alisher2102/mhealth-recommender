import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authGuard } from "../middleware/authGuard.js";
import { computeMarsScores } from "../lib/scoring/mars.js";
import { validateMarsInput } from "../lib/scoring/validateMars.js";

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

appsRouter.post("/:id/mars", authGuard, async (req: Request, res: Response) => {
  try {
    const appId = req.params.id;
    const app = await prisma.app.findUnique({ where: { id: appId } });
    if (!app) {
      return res.status(404).json({ error: { message: "App not found" } });
    }

    const validation = validateMarsInput(req.body);
    if (!validation.ok || !validation.items) {
      return res.status(400).json({
        error: { message: "Invalid MARS input", details: validation.errors },
      });
    }
    const scores = computeMarsScores(validation.items);
    const evaluation = await prisma.marsEvaluation.upsert({
      where: { appId },
      create: {
        appId,
        evaluatorId: req.auth!.sub,
        ...validation.items,
        ...scores,
      },
      update: {
        evaluatorId: req.auth!.sub,
        ...validation.items,
        ...scores,
      },
    });
    return res.status(201).json(evaluation);
  } catch (err) {
    console.error("Failed to save MARS evaluation:", err);
    return res
      .status(500)
      .json({ error: { message: "Failed to save MARS evaluation" } });
  }
});
