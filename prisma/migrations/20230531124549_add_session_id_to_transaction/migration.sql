-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "session_id" TEXT;

-- CreateIndex
CREATE INDEX "transactions_session_id_idx" ON "transactions"("session_id");
