/**
 * Imports MARS evaluations from a JSON file into the database.
 *
 * Why a script rather than the admin UI deferred by ADR-016: 18 apps x 23 items
 * is 414 values, and hand-writing that many curl requests is error-prone and
 * leaves the scores only in shell history. Keeping them in a reviewable file
 * makes the evaluation reproducible, which matters because these apps change
 * and the thesis must state which version was assessed.
 *
 * The script also sets storeUrl, versionEvaluated and lastUpdatedOn, which no
 * API currently exposes (defect M8).
 *
 * Usage:
 *   npm run import:mars                  # uses data/mars-scores.json
 *   npm run import:mars -- other.json
 *
 * Entries whose items are still all zero are reported and skipped, so scoring
 * can be done in batches rather than all in one sitting.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { computeMarsScores } from "../src/lib/scoring/mars.js";
import { validateMarsInput } from "../src/lib/scoring/validateMars.js";

interface Entry {
  app: string;
  category?: string;
  storeUrl?: string;
  versionEvaluated?: string;
  dateEvaluated?: string;
  notes?: string;
  items: Record<string, unknown>;
}

const file = process.argv[2] ?? "data/mars-scores.json";

/** An entry is "not yet scored" if every item is still the 0 placeholder. */
function isUnscored(entry: Entry): boolean {
  const values = Object.values(entry.items ?? {});
  return values.length === 0 || values.every((v) => v === 0);
}

async function main() {
  const entries: Entry[] = JSON.parse(readFileSync(resolve(file), "utf8"));

  // Any admin will do as the evaluator; there is a single researcher (ADR:
  // single-rater design). Prefer the one named in .env if present.
  const adminEmail = process.env.ADMIN_EMAIL;
  const evaluator =
    (adminEmail
      ? await prisma.admin.findUnique({ where: { email: adminEmail } })
      : null) ?? (await prisma.admin.findFirst());

  if (!evaluator) {
    throw new Error(
      "No Admin row found. Run `npx prisma db seed` first so an evaluator exists.",
    );
  }

  let imported = 0;
  const skipped: string[] = [];
  const failed: string[] = [];

  for (const entry of entries) {
    const app = await prisma.app.findFirst({ where: { name: entry.app } });
    if (!app) {
      // A name typo would otherwise silently score nothing.
      failed.push(`${entry.app}: no app with this name in the database`);
      continue;
    }

    if (isUnscored(entry)) {
      skipped.push(entry.app);
      continue;
    }

    const validation = validateMarsInput(entry.items);
    if (!validation.ok || !validation.items) {
      failed.push(`${entry.app}: ${validation.errors.join("; ")}`);
      continue;
    }

    const scores = computeMarsScores(validation.items);

    // Record which version was assessed and when. Without this the evaluation
    // is not reproducible, since these apps are updated frequently.
    await prisma.app.update({
      where: { id: app.id },
      data: {
        storeUrl: entry.storeUrl?.trim() || app.storeUrl,
        versionEvaluated: entry.versionEvaluated?.trim() || app.versionEvaluated,
        lastUpdatedOn: entry.dateEvaluated
          ? new Date(entry.dateEvaluated)
          : app.lastUpdatedOn,
      },
    });

    await prisma.marsEvaluation.upsert({
      where: { appId: app.id },
      create: {
        appId: app.id,
        evaluatorId: evaluator.id,
        notes: entry.notes?.trim() || null,
        ...validation.items,
        ...scores,
      },
      update: {
        evaluatorId: evaluator.id,
        notes: entry.notes?.trim() || null,
        ...validation.items,
        ...scores,
      },
    });

    imported += 1;
    console.log(
      `  ${entry.app.padEnd(32)} total ${scores.marsTotal.toFixed(2)}  ` +
        `(E ${scores.engagementMean} F ${scores.functionalityMean} ` +
        `A ${scores.aestheticsMean} I ${scores.informationMean})`,
    );
  }

  console.log(`\nImported ${imported} of ${entries.length} evaluations.`);

  if (skipped.length > 0) {
    console.log(`\nNot yet scored (${skipped.length}):`);
    for (const name of skipped) console.log(`  - ${name}`);
  }

  if (failed.length > 0) {
    console.log(`\nRejected (${failed.length}):`);
    for (const message of failed) console.log(`  - ${message}`);
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
