ALTER TABLE "customers"
    ADD COLUMN "address" TEXT,
    ADD COLUMN "smsConsent" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "transactions"
    DROP CONSTRAINT "transactions_customerId_fkey",
    ALTER COLUMN "amount" TYPE DECIMAL(12, 2)
        USING ROUND("amount"::numeric, 2),
    DROP COLUMN "method";

ALTER TABLE "customers"
    ADD CONSTRAINT "customers_id_userId_key" UNIQUE ("id", "userId");

ALTER TABLE "transactions"
    ADD CONSTRAINT "transactions_customerId_userId_fkey"
    FOREIGN KEY ("customerId", "userId")
    REFERENCES "customers"("id", "userId")
    ON DELETE CASCADE ON UPDATE CASCADE;

DROP TYPE "PaymentMethod";
