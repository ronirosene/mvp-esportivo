-- Migration 0016: Add Sponsor model and SponsorType enum

-- Create SponsorType enum
CREATE TYPE "SponsorType" AS ENUM ('PATROCINADOR', 'APOIADOR', 'PARCEIRO', 'PUBLICIDADE');

-- Create Sponsor table
CREATE TABLE "Sponsor" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "logoUrl" TEXT,
    "website" TEXT,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "tipo" "SponsorType" NOT NULL DEFAULT 'PATROCINADOR',
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);
