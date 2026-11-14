-- Keep existing rooms enabled. Availability still records occupancy separately.
ALTER TABLE `Room` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;
