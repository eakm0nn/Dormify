-- AlterTable
ALTER TABLE `InvoiceItem` ADD COLUMN `periodEnd` DATE NULL,
    ADD COLUMN `periodStart` DATE NULL,
    ADD COLUMN `readingEndId` INTEGER NULL,
    ADD COLUMN `readingStartId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Lease` ADD COLUMN `checkoutDate` DATE NULL,
    ADD COLUMN `previousLeaseId` INTEGER NULL;

-- AlterTable
ALTER TABLE `MeterReading` ADD COLUMN `offset` DECIMAL(14, 3) NOT NULL DEFAULT 0,
    ADD COLUMN `rawValue` DECIMAL(14, 3) NULL;

-- AlterTable
ALTER TABLE `Property` ADD COLUMN `amenities` JSON NULL;

-- AlterTable
ALTER TABLE `RentalPolicy` ADD COLUMN `autoBilling` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Room` ADD COLUMN `amenities` JSON NULL;

-- CreateTable
CREATE TABLE `RoomPhoto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `data` MEDIUMBLOB NOT NULL,
    `checksum` CHAR(64) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RoomPhoto_roomId_id_idx`(`roomId`, `id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MeterChange` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `readingId` INTEGER NOT NULL,
    `kind` VARCHAR(16) NOT NULL,
    `reason` VARCHAR(500) NOT NULL,
    `before` JSON NOT NULL,
    `after` JSON NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MeterChange_roomId_createdAt_idx`(`roomId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaseRevision` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leaseId` INTEGER NOT NULL,
    `kind` VARCHAR(16) NOT NULL,
    `reason` VARCHAR(500) NOT NULL,
    `before` JSON NOT NULL,
    `after` JSON NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaseCloseout` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leaseId` INTEGER NOT NULL,
    `checkoutDate` DATE NOT NULL,
    `rentDue` DECIMAL(12, 2) NOT NULL,
    `utilitiesDue` DECIMAL(12, 2) NOT NULL,
    `previouslyPaid` DECIMAL(12, 2) NOT NULL,
    `balance` DECIMAL(12, 2) NOT NULL,
    `details` JSON NOT NULL,
    `reason` VARCHAR(500) NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `settledAt` DATETIME(3) NULL,
    `method` VARCHAR(16) NULL,

    UNIQUE INDEX `LeaseCloseout_leaseId_key`(`leaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceAdjustment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `reason` VARCHAR(500) NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `refundedAt` DATETIME(3) NULL,
    `refundMethod` VARCHAR(16) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoomPhoto` ADD CONSTRAINT `RoomPhoto_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MeterChange` ADD CONSTRAINT `MeterChange_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaseRevision` ADD CONSTRAINT `LeaseRevision_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaseCloseout` ADD CONSTRAINT `LeaseCloseout_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceAdjustment` ADD CONSTRAINT `InvoiceAdjustment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
