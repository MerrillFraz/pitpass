-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('HOT_LAPS', 'QUALIFYING', 'HEAT_RACE', 'FEATURE');

-- AlterTable
ALTER TABLE "RaceResult" ADD COLUMN     "sessionType" "SessionType",
ADD COLUMN     "startPosition" INTEGER;

-- CreateTable
CREATE TABLE "MaintenanceEvent" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "lapInterval" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarSetup" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "tripStopId" TEXT,
    "tireCompound" TEXT,
    "tireSizeFront" TEXT,
    "tireSizeRear" TEXT,
    "offset" DOUBLE PRECISION,
    "springRateFront" DOUBLE PRECISION,
    "springRateRear" DOUBLE PRECISION,
    "rideHeightFront" DOUBLE PRECISION,
    "rideHeightRear" DOUBLE PRECISION,
    "shockRateFront" TEXT,
    "shockRateRear" TEXT,
    "gearRatio" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarSetup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaintenanceEvent" ADD CONSTRAINT "MaintenanceEvent_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarSetup" ADD CONSTRAINT "CarSetup_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarSetup" ADD CONSTRAINT "CarSetup_tripStopId_fkey" FOREIGN KEY ("tripStopId") REFERENCES "TripStop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
