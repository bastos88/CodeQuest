CREATE INDEX IF NOT EXISTS "Question_categoryId_difficulty_status_isActive_archivedAt_idx"
ON "Question"("categoryId", "difficulty", "status", "isActive", "archivedAt");
