-- Migration 0014: Remove categoria, add @unique on Sport.nome

-- Remove categoria column
ALTER TABLE "Sport" DROP COLUMN "categoria";

-- Add unique constraint on nome
-- (data deduplication was handled by migration 0013 script)
CREATE UNIQUE INDEX "Sport_nome_key" ON "Sport"("nome");
