ALTER TABLE "customers"
    ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "customers_shopOwnerId_archivedAt_idx"
    ON "customers"("shopOwnerId", "archivedAt");
