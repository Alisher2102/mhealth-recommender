import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { computeSusScore } from "../lib/scoring/scoring.js";
import { validateSusInput } from "../lib/scoring/validationSusHelper.js";

export const surveyRouter = Router();

const VALID_CONDITIONS = ["T2DM", "HYPERTENSION", "COPD"] as const;
const CURRENT_CONSENT_VERSION = "v1";

/** Minimum apps a condition needs before a session can run (ADR-010). */
const MIN_APPS_PER_SESSION = 3;
/** Maximum apps shown to one participant, to keep the task tolerable. */
const MAX_APPS_PER_SESSION = 5;

/**
 * Unbiased Fisher-Yates shuffle. Chosen over `sort(() => Math.random() - 0.5)`
 * because the latter is statistically biased and would undermine the
 * randomisation claim in the methodology (ADR-010).
 */
function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
/**
 * A completed session must stop accepting writes, or `status` and `completedAt`
 * cannot serve as the analysis-eligibility criterion they exist for.
 */
function rejectIfNotInProgress(
  session: { status: string },
  res: Response,
): boolean {
  if (session.status !== "in_progress") {
    res.status(409).json({
      error: { message: "This survey session is already complete" },
    });
    return true;
  }
  return false;
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
    return res.status(201).json({
      participantId: participant.id,
      consentVersion: participant.consentVersion,
    });
  } catch (err) {
    console.error("Failed to create participant", err);
    return res
      .status(500)
      .json({ error: { message: "Failed to register participant" } });
  }
});

surveyRouter.post("/survey/sessions", async (req: Request, res: Response) => {
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
          message: `condition must be one of: ${VALID_CONDITIONS.join(", ")}.`,
        },
      });
    }

    const apps = await prisma.app.findMany({
      where: { category: condition, isActive: true },
      select: { id: true },
    });

    if (apps.length < MIN_APPS_PER_SESSION) {
      return res.status(409).json({
        error: {
          message:
            "Not enough apps available for this condition to run a session",
        },
      });
    }

    const shuffled = shuffle(apps.map((a) => a.id));
    const assigned = shuffled.slice(
      0,
      Math.min(MAX_APPS_PER_SESSION, shuffled.length),
    );

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

/**
 * Returns the session with its assigned apps hydrated, in presentation order,
 * plus which apps already have a SUS response. The survey UI needs app names and
 * descriptions to render, and needs progress so a participant can resume rather
 * than restart (which would otherwise lose partial data).
 */
surveyRouter.get(
  "/survey/sessions/:id",
  async (req: Request, res: Response) => {
    try {
      const session = await prisma.surveySession.findUnique({
        where: { id: req.params.id },
        include: { susResponses: { select: { appId: true } } },
      });
      if (!session) {
        return res
          .status(404)
          .json({ error: { message: "Survey session not found" } });
      }

      const order: string[] = JSON.parse(session.presentationOrder);
      const apps = await prisma.app.findMany({
        where: { id: { in: order } },
        select: {
          id: true,
          name: true,
          category: true,
          platform: true,
          storeUrl: true,
          description: true,
          keyFeatures: true,
        },
      });

      // Preserve the stored presentation order; findMany order is not guaranteed.
      const byId = new Map(apps.map((a) => [a.id, a]));
      const ordered = order
        .map((id) => byId.get(id))
        .filter((a): a is (typeof apps)[number] => a !== undefined);

      const completedAppIds = session.susResponses.map((r) => r.appId);
      const skippedAppIds: string[] = JSON.parse(session.skippedAppIds);

      return res.json({
        sessionId: session.id,
        condition: session.condition,
        status: session.status,
        apps: ordered,
        completedAppIds,
        skippedAppIds,
        remainingCount:
          ordered.length - completedAppIds.length - skippedAppIds.length,
      });
    } catch (err) {
      console.error("Failed to load session", err);
      return res
        .status(500)
        .json({ error: { message: "Failed to load survey session" } });
    }
  },
);

surveyRouter.post(
  "/survey/sessions/:id/sus",
  async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.id;
      const { appId } = req.body ?? {};

      const session = await prisma.surveySession.findUnique({
        where: { id: sessionId },
      });
      if (!session) {
        return res
          .status(404)
          .json({ error: { message: "Survey session not found" } });
      }
      if (rejectIfNotInProgress(session, res)) return;
      if (typeof appId !== "string") {
        return res
          .status(400)
          .json({ error: { message: "appId is required" } });
      }
      const assigned: string[] = JSON.parse(session.assignedAppIds);
      if (!assigned.includes(appId)) {
        return res.status(400).json({
          error: {
            message: "This app is not part of the current survey session",
          },
        });
      }

      const skippedIds: string[] = JSON.parse(session.skippedAppIds);
      if (skippedIds.includes(appId)) {
        return res.status(409).json({
          error: {
            message: "This app was declined and cannot now be rated",
          },
        });
      }

      const validation = validateSusInput(req.body);
      if (!validation.ok || !validation.answers) {
        return res.status(400).json({
          error: { message: "Invalid SUS input", details: validation.errors },
        });
      }

      const susScore = computeSusScore(validation.answers);

      const response = await prisma.susResponse.upsert({
        where: { sessionId_appId: { sessionId, appId } },
        create: { sessionId, appId, ...validation.answers, susScore },
        update: { ...validation.answers, susScore },
      });

      return res.status(201).json({ id: response.id, appId, susScore });
    } catch (err) {
      console.error("Failed to save SUS response", err);
      return res
        .status(500)
        .json({ error: { message: "Failed to save SUS response" } });
    }
  },
);

surveyRouter.post(
  "/survey/sessions/:id/skip",
  async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.id;
      const { appId } = req.body ?? {};

      const session = await prisma.surveySession.findUnique({
        where: { id: sessionId },
        include: { susResponses: { select: { appId: true } } },
      });
      if (!session) {
        return res
          .status(404)
          .json({ error: { message: "Survey session not found" } });
      }
      if (rejectIfNotInProgress(session, res)) return;

      if (typeof appId !== "string") {
        return res
          .status(400)
          .json({ error: { message: "appId is required" } });
      }
      const assigned: string[] = JSON.parse(session.assignedAppIds);
      if (!assigned.includes(appId)) {
        return res.status(400).json({
          error: {
            message: "This app is not part of the current survey session",
          },
        });
      }

      if (session.susResponses.some((r) => r.appId === appId)) {
        return res.status(409).json({
          error: {
            message: "This app already has a response and cannot be declined",
          },
        });
      }
      const skipped: string[] = JSON.parse(session.skippedAppIds);
      if (!skipped.includes(appId)) {
        skipped.push(appId);
        await prisma.surveySession.update({
          where: { id: sessionId },
          data: { skippedAppIds: JSON.stringify(skipped) },
        });
      }
      return res.status(201).json({ sessionId, skippedAppIds: skipped });
    } catch (err) {
      console.error("Failed to record skipped app", err);
      return res
        .status(500)
        .json({ error: { message: "Failed to record your choice" } });
    }
  },
);
/**
 * Records the participant's own preference ordering of the apps they tried.
 *
 * This is the comparison data for Objective 5 / marking criterion C6: the
 * system-generated ranking is validated against these human rankings (e.g. by
 * Spearman rank correlation). Without it the validation chapter has nothing to
 * correlate against, so this endpoint is research-critical, not optional.
 *
 * Upserted so a participant may revise their ranking without creating duplicate
 * rows that would silently double-count in analysis.
 */
surveyRouter.post(
  "/survey/sessions/:id/preferences",
  async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.id;
      const { rankedAppIds } = req.body ?? {};

      const session = await prisma.surveySession.findUnique({
        where: { id: sessionId },
      });
      if (!session) {
        return res
          .status(404)
          .json({ error: { message: "Survey session not found" } });
      }
      if (rejectIfNotInProgress(session, res)) return;
      if (
        !Array.isArray(rankedAppIds) ||
        !rankedAppIds.every((id) => typeof id === "string")
      ) {
        return res.status(400).json({
          error: { message: "rankedAppIds must be an array of app id strings" },
        });
      }

      const assigned: string[] = JSON.parse(session.assignedAppIds);
      const skipped: string[] = JSON.parse(session.skippedAppIds);
      // Only apps the participant actually rated can be ranked -- ranking a
      // declined app would be meaningless, and the system ranking it is
      // compared against is built from rated apps.
      const rankable = assigned.filter((id) => !skipped.includes(id));

      const unknown = rankedAppIds.filter((id) => !rankable.includes(id));
      if (unknown.length > 0) {
        return res.status(400).json({
          error: {
            message:
              "rankedAppIds contains apps not available to rank in this session",
            details: unknown,
          },
        });
      }

      if (new Set(rankedAppIds).size !== rankedAppIds.length) {
        return res.status(400).json({
          error: {
            message: "rankedAppIds must not contain duplicates",
          },
        });
      }

      if (rankedAppIds.length !== rankable.length) {
        return res.status(400).json({
          error: {
            message: `rankedAppIds must rank all ${rankable.length} rated apps`,
          },
        });
      }

      const existing = await prisma.appPreference.findFirst({
        where: { sessionId },
        select: { id: true },
      });

      const preference = existing
        ? await prisma.appPreference.update({
            where: { id: existing.id },
            data: { rankedAppIds: JSON.stringify(rankedAppIds) },
          })
        : await prisma.appPreference.create({
            data: { sessionId, rankedAppIds: JSON.stringify(rankedAppIds) },
          });

      return res.status(201).json({
        id: preference.id,
        sessionId,
        rankedAppIds,
      });
    } catch (err) {
      console.error("Failed to save app preferences", err);
      return res
        .status(500)
        .json({ error: { message: "Failed to save app preferences" } });
    }
  },
);

/**
 * Marks a session finished. Distinguishing completed from abandoned sessions
 * matters for reporting response rates and for deciding which sessions are
 * eligible for analysis.
 */
surveyRouter.patch(
  "/survey/sessions/:id/complete",
  async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.id;
      const session = await prisma.surveySession.findUnique({
        where: { id: sessionId },
        include: { susResponses: { select: { appId: true } } },
      });
      if (!session) {
        return res
          .status(404)
          .json({ error: { message: "Survey session not found" } });
      }
      if (rejectIfNotInProgress(session, res)) return;
      const assigned: string[] = JSON.parse(session.assignedAppIds);
      const skipped: string[] = JSON.parse(session.skippedAppIds);
      const handled = session.susResponses.length + skipped.length;

      if (handled < assigned.length) {
        return res.status(409).json({
          error: {
            message:
              "Cannot complete: some assigned apps are neither rated nor declined",
            details: {
              expected: assigned.length,
              rated: session.susResponses.length,
              declined: skipped.length,
            },
          },
        });
      }

      const updated = await prisma.surveySession.update({
        where: { id: sessionId },
        data: { status: "completed", completedAt: new Date() },
      });

      return res.json({
        sessionId: updated.id,
        status: updated.status,
        completedAt: updated.completedAt,
      });
    } catch (err) {
      console.error("Failed to complete session", err);
      return res
        .status(500)
        .json({ error: { message: "Failed to complete survey session" } });
    }
  },
);
