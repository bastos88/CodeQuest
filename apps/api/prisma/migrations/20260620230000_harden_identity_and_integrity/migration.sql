-- Normalize identity keys before enforcing case-insensitive uniqueness.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "User"
    GROUP BY LOWER(TRIM("email"))
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate user emails must be reconciled before this migration';
  END IF;
END $$;

UPDATE "User" SET "email" = LOWER(TRIM("email"));

CREATE UNIQUE INDEX "User_email_lower_key" ON "User" (LOWER("email"));

CREATE TABLE "OAuthIdentity" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OAuthIdentity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OAuthIdentity_provider_providerId_key"
  ON "OAuthIdentity"("provider", "providerId");
CREATE UNIQUE INDEX "OAuthIdentity_userId_provider_key"
  ON "OAuthIdentity"("userId", "provider");
CREATE INDEX "OAuthIdentity_userId_idx" ON "OAuthIdentity"("userId");

ALTER TABLE "OAuthIdentity"
  ADD CONSTRAINT "OAuthIdentity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "OAuthIdentity" (
  "id", "provider", "providerId", "email", "userId", "updatedAt"
)
SELECT
  MD5("provider" || ':' || "providerId")::uuid::text,
  "provider",
  "providerId",
  LOWER(TRIM("email")),
  "id",
  CURRENT_TIMESTAMP
FROM "User"
WHERE "provider" IS NOT NULL AND "providerId" IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE "GamificationEvent" ADD COLUMN "sourceKey" TEXT;
CREATE UNIQUE INDEX "GamificationEvent_sourceKey_key"
  ON "GamificationEvent"("sourceKey");

ALTER TABLE "QuizSession"
  ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '2 hours');

ALTER TABLE "QuizSession"
  ADD CONSTRAINT "QuizSession_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizSession"
  ADD CONSTRAINT "QuizSession_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QuizAnswer"
  ADD CONSTRAINT "QuizAnswer_selectedOptionId_fkey"
  FOREIGN KEY ("selectedOptionId") REFERENCES "Alternative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ArenaMatch"
  ADD CONSTRAINT "ArenaMatch_winnerId_fkey"
  FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "RefreshToken_userId_expiresAt_idx" ON "RefreshToken"("userId", "expiresAt");
CREATE INDEX "QuizSession_userId_createdAt_idx" ON "QuizSession"("userId", "createdAt");
CREATE INDEX "QuizSession_categoryId_idx" ON "QuizSession"("categoryId");
CREATE INDEX "QuizSession_expiresAt_idx" ON "QuizSession"("expiresAt");
CREATE INDEX "QuizResult_userId_createdAt_idx" ON "QuizResult"("userId", "createdAt");
CREATE INDEX "QuizAnswer_quizResultId_idx" ON "QuizAnswer"("quizResultId");
CREATE INDEX "QuizAnswer_questionId_idx" ON "QuizAnswer"("questionId");
CREATE INDEX "Review_questionId_createdAt_idx" ON "Review"("questionId", "createdAt");
CREATE INDEX "Review_reviewerId_createdAt_idx" ON "Review"("reviewerId", "createdAt");
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
CREATE INDEX "Report_userId_createdAt_idx" ON "Report"("userId", "createdAt");
CREATE INDEX "ArenaMatch_playerAId_createdAt_idx" ON "ArenaMatch"("playerAId", "createdAt");
CREATE INDEX "ArenaMatch_playerBId_createdAt_idx" ON "ArenaMatch"("playerBId", "createdAt");
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");
CREATE INDEX "ActivityLog_action_createdAt_idx" ON "ActivityLog"("action", "createdAt");
