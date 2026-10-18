ALTER TABLE "customers" RENAME COLUMN "userId" TO "shopOwnerId";
ALTER TABLE "transactions" RENAME COLUMN "userId" TO "shopOwnerId";

ALTER INDEX "customers_userId_phone_key"
    RENAME TO "customers_shopOwnerId_phone_key";
ALTER TABLE "customers"
    RENAME CONSTRAINT "customers_id_userId_key"
    TO "customers_id_shopOwnerId_key";
ALTER TABLE "customers"
    RENAME CONSTRAINT "customers_userId_fkey"
    TO "customers_shopOwnerId_fkey";

ALTER TABLE "transactions"
    RENAME CONSTRAINT "transactions_userId_fkey"
    TO "transactions_shopOwnerId_fkey";
ALTER TABLE "transactions"
    RENAME CONSTRAINT "transactions_customerId_userId_fkey"
    TO "transactions_customerId_shopOwnerId_fkey";

ALTER INDEX "customers_userId_idx" RENAME TO "customers_shopOwnerId_idx";
ALTER INDEX "transactions_userId_idx" RENAME TO "transactions_shopOwnerId_idx";
