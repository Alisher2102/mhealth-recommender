-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "versionEvaluated" TEXT,
    "storeUrl" TEXT,
    "description" TEXT,
    "keyFeatures" TEXT,
    "lastUpdatedOn" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MarsEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "a1Entertainment" INTEGER NOT NULL,
    "a2Interest" INTEGER NOT NULL,
    "a3Customisation" INTEGER NOT NULL,
    "a4Interactivity" INTEGER NOT NULL,
    "a5TargetGroup" INTEGER NOT NULL,
    "b1Performance" INTEGER NOT NULL,
    "b2EaseOfUse" INTEGER NOT NULL,
    "b3Navigation" INTEGER NOT NULL,
    "b4GesturalDesign" INTEGER NOT NULL,
    "c1Layout" INTEGER NOT NULL,
    "c2Graphics" INTEGER NOT NULL,
    "c3VisualAppeal" INTEGER NOT NULL,
    "d1Accuracy" INTEGER NOT NULL,
    "d2Goals" INTEGER NOT NULL,
    "d3QualityOfInfo" INTEGER NOT NULL,
    "d4QuantityOfInfo" INTEGER NOT NULL,
    "d5VisualInfo" INTEGER NOT NULL,
    "d6Credibility" INTEGER NOT NULL,
    "d7EvidenceBase" INTEGER NOT NULL,
    "e1WouldRecommend" INTEGER NOT NULL,
    "e2UseFrequency" INTEGER NOT NULL,
    "e3WouldPay" INTEGER NOT NULL,
    "e4OverallRating" INTEGER NOT NULL,
    "engagementMean" REAL NOT NULL,
    "functionalityMean" REAL NOT NULL,
    "aestheticsMean" REAL NOT NULL,
    "informationMean" REAL NOT NULL,
    "subjectiveMean" REAL NOT NULL,
    "marsTotal" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarsEvaluation_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarsEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "Admin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consentGiven" BOOLEAN NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "consentedAt" DATETIME NOT NULL,
    "ageBand" TEXT,
    "gender" TEXT,
    "hasChronicCondition" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SurveySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "assignedAppIds" TEXT NOT NULL,
    "presentationOrder" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "SurveySession_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SusResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "q1" INTEGER NOT NULL,
    "q2" INTEGER NOT NULL,
    "q3" INTEGER NOT NULL,
    "q4" INTEGER NOT NULL,
    "q5" INTEGER NOT NULL,
    "q6" INTEGER NOT NULL,
    "q7" INTEGER NOT NULL,
    "q8" INTEGER NOT NULL,
    "q9" INTEGER NOT NULL,
    "q10" INTEGER NOT NULL,
    "susScore" REAL NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SusResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SurveySession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SusResponse_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "rankedAppIds" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppPreference_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SurveySession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AlgorithmConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "wMars" REAL NOT NULL,
    "wSus" REAL NOT NULL,
    "normalisationMode" TEXT NOT NULL,
    "conditionMatchBoost" REAL NOT NULL DEFAULT 0,
    "minSusResponses" INTEGER NOT NULL DEFAULT 3,
    "provenance" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MarsEvaluation_appId_key" ON "MarsEvaluation"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "SusResponse_sessionId_appId_key" ON "SusResponse"("sessionId", "appId");

-- CreateIndex
CREATE UNIQUE INDEX "AlgorithmConfig_name_key" ON "AlgorithmConfig"("name");
