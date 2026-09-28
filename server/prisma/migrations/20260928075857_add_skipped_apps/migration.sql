-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SurveySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "assignedAppIds" TEXT NOT NULL,
    "presentationOrder" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "skippedAppIds" TEXT NOT NULL DEFAULT '[]',
    "completedAt" DATETIME,
    CONSTRAINT "SurveySession_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SurveySession" ("assignedAppIds", "completedAt", "condition", "id", "participantId", "presentationOrder", "startedAt", "status") SELECT "assignedAppIds", "completedAt", "condition", "id", "participantId", "presentationOrder", "startedAt", "status" FROM "SurveySession";
DROP TABLE "SurveySession";
ALTER TABLE "new_SurveySession" RENAME TO "SurveySession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
