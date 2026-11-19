CREATE TABLE `DormitoryInstallation` (
  `id` VARCHAR(64) NOT NULL,
  `propertyId` INTEGER NOT NULL,
  UNIQUE INDEX `DormitoryInstallation_propertyId_key` (`propertyId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `DormitoryInstallation` ADD CONSTRAINT `DormitoryInstallation_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
-- Adopt only an unambiguous existing dormitory. Never remove or choose between legacy rows.
INSERT INTO `DormitoryInstallation` (`id`, `propertyId`)
SELECT 'dormify', MIN(`id`) FROM `Property` HAVING COUNT(*) = 1;
ALTER TABLE `InvoiceAdjustment` ADD COLUMN `itemType` VARCHAR(16) NULL;
