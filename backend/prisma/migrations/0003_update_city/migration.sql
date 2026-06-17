-- Add siglaEstado and updatedAt to City
ALTER TABLE "City" ADD COLUMN "siglaEstado" TEXT NOT NULL DEFAULT '';
ALTER TABLE "City" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Unique constraint on nome + siglaEstado
CREATE UNIQUE INDEX "City_nome_siglaEstado_key" ON "City"("nome", "siglaEstado");
