import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import {
  rankApps,
  type AppScoreInput,
  type RecommendationConfig,
} from "../lib/scoring/recommend.js";

export const recommendationsRouter = Router();

const VALID_CONDITIONS = ["T2DM", "HYPERTENSION", "COPD"];

recommendationsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const condition = String(req.query.condition ?? "");
    if (!VALID_CONDITIONS.includes(condition)) {
      return res.status(400).json({
        error: {
          message: `condition must be one of: ${VALID_CONDITIONS.join(", ")}.`,
        },
      });
    }

    const defaultConfig = await prisma.algorithmConfig.findFirst({
      where: { isDefault: true },
    });

    let wMars = defaultConfig?.wMars ?? 0.6;
    let wSus = defaultConfig?.wSus ?? 0.4;
    const minSusResponses = defaultConfig?.minSusResponses ?? 3;

    if (req.query.wMars !== undefined || req.query.wSus !== undefined) {
      const qMars = Number(req.query.wMars);
      const qSus = Number(req.query.wSus);
      if (
        Number.isNaN(qMars) ||
        Number.isNaN(qSus) ||
        qMars < 0 ||
        qSus < 0 ||
        qMars + qSus === 0
      ) {
        return res.status(400).json({
          error: {
            message:
              "wMars and wSus must be non-negative numbers that are not both zero",
          },
        });
      }
      const total = qMars + qSus;
      wMars = qMars / total;
      wSus = qSus / total;
    }
    const config: RecommendationConfig = { wMars, wSus, minSusResponses };

    const apps = await prisma.app.findMany({
      where: { category: condition, isActive: true },
      select: {
        id: true,
        name: true,
        marsEvaluation: { select: { marsTotal: true } },
      },
    });

    const susAgg = await prisma.susResponse.groupBy({
      by: ["appId"],
      _avg: { susScore: true },
      _count: { _all: true },
    });
    const susByApp = new Map(susAgg.map((row) => [row.appId, row]));

    const inputs: AppScoreInput[] = apps.map((app) => {
      const agg = susByApp.get(app.id);
      const susMean = agg?._avg.susScore ?? null;
      const susCount = agg?._count._all ?? 0;
      return {
        appId: app.id,
        name: app.name,
        marsTotal: app.marsEvaluation?.marsTotal ?? null,
        susMean: susMean === null ? null : Math.round(susMean * 100) / 100,
        susCount,
      };
    });
    const result = rankApps(inputs, config);
    return res.json(result);
  } catch (err) {
    console.error("Failed to build recommendations:", err);
    return res
      .status(500)
      .json({ error: { message: "Failed to build recommendations" } });
  }
});
