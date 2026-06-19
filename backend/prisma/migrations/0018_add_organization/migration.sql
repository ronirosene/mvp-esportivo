-- CreateEnum (only the new ones)
CREATE TYPE "OrganizationPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- AlterEnum - add new roles
ALTER TYPE "Role" ADD VALUE 'ADMIN_GLOBAL';
ALTER TYPE "Role" ADD VALUE 'ADMIN_ORGANIZACAO';

-- CreateTable: Organization
CREATE TABLE "Organization" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "plan" "OrganizationPlan" NOT NULL DEFAULT 'FREE',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoFavicon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- AlterTable: User - add organizationId
ALTER TABLE "User" ADD COLUMN "organizationId" UUID;

-- AddForeignKey for User
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: Event - add organizationId
ALTER TABLE "Event" ADD COLUMN "organizationId" UUID;

-- AddForeignKey for Event
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Sponsor - add organizationId
ALTER TABLE "Sponsor" ADD COLUMN "organizationId" UUID;

-- AddForeignKey for Sponsor
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
