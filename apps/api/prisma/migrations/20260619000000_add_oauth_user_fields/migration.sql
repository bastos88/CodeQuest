ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

ALTER TABLE "User" ADD COLUMN "provider" TEXT;
ALTER TABLE "User" ADD COLUMN "providerId" TEXT;

CREATE UNIQUE INDEX "User_provider_providerId_key" ON "User"("provider", "providerId");
