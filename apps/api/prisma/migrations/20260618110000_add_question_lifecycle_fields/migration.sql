-- Some existing databases received these columns before migration history did.
-- The timestamp places this idempotent repair before the dependent index.
ALTER TABLE "Question"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "reviewedById" TEXT,
  ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
