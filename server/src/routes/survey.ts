import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

export const surveyRouter = Router();

const VALID_CONDITIONS = ["T2DM", "HYPERTENSION", "COPD"] as const;
const CURRENT_CONSENT_VERSION = "v1";

function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

surveyRouter.post("/participants", async (req: Request, res: Response) => {
  try {
    const { consentGiven, ageBand, gender, hasChronicCondition } =
      req.body ?? {};
    if (consentGiven !== true) {
      return res.status(400).json({
        error: { message: "Informed consent is required to participate" },
      });
    }

    const participant = await prisma.participant.create({
      data: {
        consentGiven: true,
        consentVersion: CURRENT_CONSENT_VERSION,
        consentedAt: new Date(),
        ageBand: typeof ageBand === "string" ? ageBand : null,
        gender: typeof gender === "string" ? gender : null,
        hasChronicCondition:
          typeof hasChronicCondition === "boolean" ? hasChronicCondition : null,
      },
    });
    return res.json(201).json({ participantId: participant.id });
  } catch (err) {
    console.error("Failed to create participant", err);
    return res
      .status(500)
      .json({ error: { message: "Failed to register participant" } });
  }
});

surveyRouter.post("/survey/sessions/", async (req: Request, res: Response) => {
  try {
    const { participantId, condition } = req.body ?? {};

    if (typeof participantId !== "string") {
      return res
        .status(400)
        .json({ error: { message: "participantId is required" } });
    }
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    });
    if (!participant || !participant.consentGiven) {
      return res
        .status(403)
        .json({ error: { message: "Valid, consented participant required" } });
    }

    if (!VALID_CONDITIONS.includes(condition)) {
      return res.status(400).json({
        error: {
          message: `condiition must be one of: ${VALID_CONDITIONS.join(", ")}.`,
        },
      });
    }

    const apps = await prisma.app.findMany({
      where: { category: condition, isActive: true },
      select: { id: true },
    });

    if (apps.length < 3) {
      return res.status(409).json({
        error: {
          message:
            "Not enough apps available for this conditon to run a session",
        },
      });
    }

    const shuffled = shuffle(apps.map((a) => a.id));
    const assigned = shuffled.slice(0, Math.min(5, shuffled.length));

    const session = await prisma.surveySession.create({
      data: {
        participantId,
        condition,
        assignedAppIds: JSON.stringify(assigned),
        presentationOrder: JSON.stringify(assigned),
        status: "in_progress",
      },
    });

    return res.status(201).json({
      sessionId: session.id,
      condition,
      appIds: assigned,
    });
  } catch (err) {
    console.error("Failed to start session", err);
    return res
      .status(500)
      .json({ error: { message: "Failed to start survey session" } });
  }
});
