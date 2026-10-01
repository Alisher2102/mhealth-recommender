import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * The 14 applications in the final evaluated set, assessed 30 Sep - 1 Oct 2026.
 *
 * Availability was verified by downloading each application on a Malaysian App
 * Store account during the evaluation period, which satisfies the inclusion
 * criterion that apps must be obtainable by participants in Malaysia. Store
 * links are given in the Malaysian storefront for that reason.
 *
 * All assessments are iOS. Android versions were not evaluated, so `platform`
 * records iOS rather than both, and the exclusion of Android is a stated
 * limitation.
 *
 * TWO APPLICATIONS WERE EXCLUDED after scoring began:
 *   - Cardilog: High Blood Pressure - payment required before any use, with no
 *     free trial, so the application could not be meaningfully assessed.
 *   - MyHeart: Blood Pressure Diary - could not be assessed reliably.
 * Both are recorded in the exclusion log in docs/MARS_SCORING_PROTOCOL.md.
 *
 * ⚠️ `description` and `keyFeatures` are intentionally EMPTY. Participants read
 * these strings on the survey screen, so they must be written from each app's
 * actual store listing rather than invented. Fill them in before recruiting.
 */
const apps = [
  // --- Type 2 diabetes (6) ---
  {
    name: "My Sugar App Diabetes Tracker",
    category: "T2DM",
    platform: "iOS",
    versionEvaluated: "1.42",
    storeUrl:
      "https://apps.apple.com/my/app/my-sugar-app-diabetes-tracker/id6566187792",
    description: "",
    keyFeatures: "",
  },
  {
    name: "Glucose Buddy",
    category: "T2DM",
    platform: "iOS",
    versionEvaluated: "5.446",
    storeUrl:
      "https://apps.apple.com/my/app/glucose-buddy-diabetes-tracker/id294754639",
    description: "",
    keyFeatures: "",
  },
  {
    name: "Blood Sugar Diary for Diabetes",
    category: "T2DM",
    platform: "iOS",
    versionEvaluated: "3.11.7",
    storeUrl:
      "https://apps.apple.com/my/app/blood-sugar-diary-for-diabetes/id1068204797",
    description: "",
    keyFeatures: "",
  },
  {
    name: "Diabetes:M",
    category: "T2DM",
    platform: "iOS",
    versionEvaluated: "9.0.902",
    storeUrl: "https://apps.apple.com/my/app/diabetes-m/id1196733537",
    description: "",
    keyFeatures: "",
  },
  {
    name: "Health2Sync - Diabetes Tracker",
    category: "T2DM",
    platform: "iOS",
    versionEvaluated: "2.112.0",
    storeUrl:
      "https://apps.apple.com/my/app/health2sync-diabetes-tracker/id806136243",
    description: "",
    keyFeatures: "",
  },
  {
    name: "Blood Glucose Diabetes Tracker",
    category: "T2DM",
    platform: "iOS",
    versionEvaluated: "4.9",
    storeUrl:
      "https://apps.apple.com/my/app/blood-glucose-diabetes-tracker/id1525105497",
    description: "",
    keyFeatures: "",
  },

  // --- Hypertension (4) ---
  {
    name: "SmartBP",
    category: "HYPERTENSION",
    platform: "iOS",
    versionEvaluated: "11.6.2",
    storeUrl:
      "https://apps.apple.com/my/app/blood-pressure-tracker-smartbp/id519076558",
    description: "",
    keyFeatures: "",
  },
  {
    name: "Blood Pressure Diary by MedM",
    category: "HYPERTENSION",
    platform: "iOS",
    versionEvaluated: "3.12.3",
    storeUrl:
      "https://apps.apple.com/my/app/blood-pressure-diary-by-medm/id1040909532",
    description: "",
    keyFeatures: "",
  },
  {
    name: "Welltory",
    category: "HYPERTENSION",
    platform: "iOS",
    versionEvaluated: "4.62.0",
    storeUrl:
      "https://apps.apple.com/my/app/welltory-stress-heart-rate/id1074367771",
    description: "",
    keyFeatures: "",
  },
  {
    name: "Blood Pressure Companion",
    category: "HYPERTENSION",
    platform: "iOS",
    versionEvaluated: "11.0",
    storeUrl:
      "https://apps.apple.com/my/app/blood-pressure-companion/id458537528",
    description: "",
    keyFeatures: "",
  },

  // --- COPD / respiratory (4) ---
  {
    name: "COPD",
    category: "COPD",
    platform: "iOS",
    versionEvaluated: "2.0",
    storeUrl: "https://apps.apple.com/my/app/copd/id394797409",
    description: "",
    keyFeatures: "",
  },
  {
    name: "My Asthma",
    category: "COPD",
    platform: "iOS",
    versionEvaluated: "1.5",
    storeUrl: "https://apps.apple.com/my/app/my-asthma/id6446431531",
    description: "",
    keyFeatures: "",
  },
  {
    name: "GOLD 2021 Pocket Guide",
    category: "COPD",
    platform: "iOS",
    versionEvaluated: "2.0",
    storeUrl: "https://apps.apple.com/my/app/gold-2021-pocket-guide/id1513859738",
    description: "",
    keyFeatures: "",
  },
  {
    name: "AsthmaMD",
    category: "COPD",
    platform: "iOS",
    versionEvaluated: "3.35",
    storeUrl: "https://apps.apple.com/my/app/asthmamd/id349343083",
    description: "",
    keyFeatures: "",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  /**
   * Delete in foreign-key order: children before parents.
   *
   * Previously this deleted apps while SusResponse rows still referenced them,
   * which fails with a foreign-key error as soon as any survey data exists --
   * i.e. exactly the wipe-and-reseed workflow ADR-018 prescribes (defect M7).
   *
   * ⚠️ This REMOVES ALL PARTICIPANT DATA. That is intended for a development
   * reset, and ADR-018 requires a clean database before real collection begins.
   * Never run this against a database holding real participant responses.
   */
  await prisma.susResponse.deleteMany();
  await prisma.appPreference.deleteMany();
  await prisma.surveySession.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.marsEvaluation.deleteMany();
  await prisma.app.deleteMany();
  await prisma.algorithmConfig.deleteMany();
  await prisma.admin.deleteMany();
  console.log("   ✓ Cleared existing data");

  for (const app of apps) {
    await prisma.app.create({ data: app });
  }
  console.log(`   ✓ Inserted ${apps.length} apps`);

  // --- Default algorithm configuration (weights + provenance) ---
  await prisma.algorithmConfig.create({
    data: {
      name: "default",
      wMars: 0.6,
      wSus: 0.4,
      normalisationMode: "theoretical",
      conditionMatchBoost: 0,
      minSusResponses: 3,
      provenance:
        "Weights favour expert quality (MARS) while retaining strong usability influence (SUS). To be justified from the literature review.",
      isDefault: true,
    },
  });
  console.log("   ✓ Inserted default algorithm config");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.admin.create({
    data: { email: adminEmail, passwordHash },
  });
  console.log(`   ✓ Inserted admin (${adminEmail})`);
  console.log("🌱 Seeding complete.");
}

main()
  .catch((e) => {
    console.error("✗ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
