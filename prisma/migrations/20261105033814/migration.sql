/*
  Warnings:

  - A unique constraint covering the columns `[shopOwnerId,idempotencyKey]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "customers_shopOwnerId_archivedAt_idx";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_shopOwnerId_idempotencyKey_key" ON "transactions"("shopOwnerId", "idempotencyKey");
