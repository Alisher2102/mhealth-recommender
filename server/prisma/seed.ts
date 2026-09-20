import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.marsEvaluation.deleteMany();
  await prisma.app.deleteMany();
  await prisma.algorithmConfig.deleteMany();

  const apps = [
    // Category 1 — Diabetes (T2DM)
    {
      name: "mySugr",
      category: "T2DM",
      platform: "Android / iOS",
      description:
        "Blood glucose logging with an HbA1c estimator and gamified tracking.",
      keyFeatures: "Glucose logging, HbA1c estimator, gamified tracking",
    },
    {
      name: "Glucose Buddy",
      category: "T2DM",
      platform: "Android / iOS",
      description:
        "Glucose log with medication reminders, coaching and an A1C tracker.",
      keyFeatures: "Glucose log, medication reminders, coaching, A1C tracker",
    },
    // Category 2 — Hypertension
    {
      name: "SmartBP",
      category: "HYPERTENSION",
      platform: "Android / iOS",
      description:
        "Blood pressure log with trend charts, colour-coded readings and doctor reports.",
      keyFeatures:
        "BP log, trend charts, doctor reports, colour-coded readings",
    },
    {
      name: "My Heart (BP Health)",
      category: "HYPERTENSION",
      platform: "Android / iOS",
      description:
        "BP diary aligned with AHA/ESC guidelines, with trend analysis.",
      keyFeatures: "BP diary, AHA/ESC guidelines, trend analysis",
    },
    // Category 3 — COPD / Respiratory
    {
      name: "myCOPD",
      category: "COPD",
      platform: "Android / iOS",
      description:
        "Pulmonary rehabilitation, inhaler technique training and symptom tracking.",
      keyFeatures: "Pulmonary rehab, inhaler training, symptom tracking",
    },
    {
      name: "Propeller Health",
      category: "COPD",
      platform: "Android / iOS",
      description:
        "Inhaler tracking with medication reminders and trigger insights.",
      keyFeatures: "Inhaler tracking, medication reminders, trigger insights",
    },
  ];

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

  await prisma.admin.deleteMany();

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.admin.create({
    data: { email: adminEmail, passwordHash },
  });
  console.log(`Inserted admin (${adminEmail})`);
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
