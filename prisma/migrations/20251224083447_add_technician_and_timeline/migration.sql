-- CreateEnum
CREATE TYPE "LaporanEventType" AS ENUM ('REPORTED', 'RECEIVED', 'ASSIGNED', 'STARTED', 'RESOLVED', 'STATUS_CHANGED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TEKNISI';

-- AlterTable
ALTER TABLE "LaporanFasilitas" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "receivedAt" TIMESTAMP(3),
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "LaporanEvent" (
    "id" TEXT NOT NULL,
    "laporanId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "type" "LaporanEventType" NOT NULL,
    "note" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaporanEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LaporanFasilitas" ADD CONSTRAINT "LaporanFasilitas_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaporanEvent" ADD CONSTRAINT "LaporanEvent_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "LaporanFasilitas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaporanEvent" ADD CONSTRAINT "LaporanEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
