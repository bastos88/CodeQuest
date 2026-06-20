CREATE TYPE "GamificationEventType" AS ENUM (
  'QUIZ_COMPLETED', 'QUIZ_PERFECT', 'ACHIEVEMENT_UNLOCKED',
  'STREAK_BONUS', 'DAILY_MISSION_COMPLETED', 'CATEGORY_MASTERY',
  'CONTRIBUTION_APPROVED', 'ARENA_WIN', 'ARENA_LOSS'
);

ALTER TABLE "User"
  ADD COLUMN "longestStreak" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastActivityAt" TIMESTAMP(3);

UPDATE "User" SET "longestStreak" = "streakDays" WHERE "streakDays" > 0;

ALTER TABLE "QuizResult" ADD COLUMN "gamificationAppliedAt" TIMESTAMP(3);

ALTER TABLE "Achievement"
  ADD COLUMN "iconKey" TEXT,
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Mission"
  ADD COLUMN "description" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "GamificationEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "GamificationEventType" NOT NULL,
  "xpChange" INTEGER NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GamificationEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");
CREATE INDEX "GamificationEvent_userId_createdAt_idx" ON "GamificationEvent"("userId", "createdAt");

ALTER TABLE "GamificationEvent"
  ADD CONSTRAINT "GamificationEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
