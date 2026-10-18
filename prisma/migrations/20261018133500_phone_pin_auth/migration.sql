-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM (
    'GROCERY',
    'PHARMACY',
    'CLOTHING_TAILORING',
    'ELECTRONICS',
    'RESTAURANT_CAFE',
    'OTHER'
);

-- Allow old accounts to remain stored while they are manually migrated.
ALTER TABLE "User"
    ALTER COLUMN "email" DROP NOT NULL,
    ALTER COLUMN "passwordHash" DROP NOT NULL;

-- Add the fields used by phone/PIN registration.
ALTER TABLE "User"
    ADD COLUMN "businessType" "BusinessType" NOT NULL DEFAULT 'OTHER',
    ADD COLUMN "phone" TEXT,
    ADD COLUMN "pinHash" TEXT;

CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
