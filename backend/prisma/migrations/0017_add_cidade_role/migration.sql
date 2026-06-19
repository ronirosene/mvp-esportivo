-- Migration 0017: Add CIDADE role, cityId on User, InviteToken model

-- Alter Role enum
ALTER TYPE "Role" ADD VALUE 'CIDADE';

-- Create RegistrationStatus enum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDENTE', 'CONFIRMADA', 'RECUSADA');

-- Add cityId and ativo to User
ALTER TABLE "User" ADD COLUMN "cityId" UUID;
ALTER TABLE "User" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true;

-- Create InviteToken table
CREATE TABLE "InviteToken" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteToken_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InviteToken_token_key" UNIQUE ("token")
);

-- Add foreign keys
ALTER TABLE "User" ADD CONSTRAINT "User_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
