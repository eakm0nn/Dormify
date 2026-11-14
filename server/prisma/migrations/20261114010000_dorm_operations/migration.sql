-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `holdExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `holdHoursSnapshot` INTEGER NULL;

-- CreateTable
CREATE TABLE `TenantProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `address` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` INTEGER NOT NULL,

    UNIQUE INDEX `TenantProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lease` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contractNo` VARCHAR(80) NOT NULL,
    `tenantId` INTEGER NOT NULL,
    `roomId` INTEGER NOT NULL,
    `bookingId` INTEGER NULL,
    `activeRoomId` INTEGER NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    `startDate` DATE NOT NULL,
    `endDate` DATE NULL,
    `monthlyRent` DECIMAL(12, 2) NOT NULL,
    `depositRequired` DECIMAL(12, 2) NOT NULL,
    `dueDaysSnapshot` INTEGER NOT NULL,
    `depositMonthsSnapshot` INTEGER NOT NULL,
    `signedDate` DATE NULL,
    `endedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Lease_contractNo_key`(`contractNo`),
    UNIQUE INDEX `Lease_bookingId_key`(`bookingId`),
    UNIQUE INDEX `Lease_activeRoomId_key`(`activeRoomId`),
    INDEX `Lease_tenantId_status_idx`(`tenantId`, `status`),
    INDEX `Lease_roomId_status_idx`(`roomId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaseOccupant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leaseId` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(30) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UtilityRate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `utilityType` VARCHAR(16) NOT NULL,
    `unitPrice` DECIMAL(12, 6) NOT NULL,
    `effectiveFrom` DATE NOT NULL,
    `sourceReference` VARCHAR(500) NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UtilityRate_utilityType_effectiveFrom_key`(`utilityType`, `effectiveFrom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MeterReading` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `utilityType` VARCHAR(16) NOT NULL,
    `readingDate` DATE NOT NULL,
    `value` DECIMAL(14, 3) NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MeterReading_roomId_utilityType_readingDate_key`(`roomId`, `utilityType`, `readingDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceNo` VARCHAR(80) NOT NULL,
    `leaseId` INTEGER NOT NULL,
    `periodStart` DATE NOT NULL,
    `periodEnd` DATE NOT NULL,
    `cycleIndex` INTEGER NOT NULL,
    `dueDaysSnapshot` INTEGER NOT NULL,
    `dueDate` DATE NOT NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'ISSUED',
    `tenantNameSnapshot` VARCHAR(100) NOT NULL,
    `roomNumberSnapshot` VARCHAR(50) NOT NULL,
    `totalAmount` DECIMAL(12, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Invoice_invoiceNo_key`(`invoiceNo`),
    UNIQUE INDEX `Invoice_leaseId_periodStart_key`(`leaseId`, `periodStart`),
    UNIQUE INDEX `Invoice_leaseId_cycleIndex_key`(`leaseId`, `cycleIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `itemType` VARCHAR(16) NOT NULL,
    `quantity` DECIMAL(14, 3) NOT NULL,
    `unitPrice` DECIMAL(12, 6) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `openingValue` DECIMAL(14, 3) NULL,
    `closingValue` DECIMAL(14, 3) NULL,
    `sourceReference` VARCHAR(500) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoicePayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `method` VARCHAR(16) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `paidDate` DATE NOT NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    `submittedBy` INTEGER NOT NULL,
    `reviewedBy` INTEGER NULL,
    `reviewedAt` DATETIME(3) NULL,
    `reason` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentProof` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paymentId` INTEGER NOT NULL,
    `data` MEDIUMBLOB NOT NULL,
    `mime` VARCHAR(32) NOT NULL,
    `checksum` CHAR(64) NOT NULL,
    `size` INTEGER NOT NULL,

    UNIQUE INDEX `PaymentProof_paymentId_key`(`paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceSettlement` (
    `invoiceId` INTEGER NOT NULL,
    `paymentId` INTEGER NOT NULL,
    `confirmedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `confirmedBy` INTEGER NOT NULL,

    UNIQUE INDEX `InvoiceSettlement_paymentId_key`(`paymentId`),
    PRIMARY KEY (`invoiceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DepositEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leaseId` INTEGER NOT NULL,
    `kind` VARCHAR(16) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `method` VARCHAR(16) NOT NULL,
    `recordedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DepositEntry_leaseId_kind_key`(`leaseId`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaintenanceRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leaseId` INTEGER NOT NULL,
    `roomId` INTEGER NOT NULL,
    `reportedBy` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'OPEN',
    `resolution` VARCHAR(1000) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Expense` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(500) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `expenseDate` DATE NOT NULL,
    `recordedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Announcement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `message` VARCHAR(1000) NOT NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `actorId` INTEGER NULL,
    `actorName` VARCHAR(100) NOT NULL,
    `action` VARCHAR(64) NOT NULL,
    `entityType` VARCHAR(64) NOT NULL,
    `entityId` INTEGER NULL,
    `summary` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fixtureScope` VARCHAR(64) NULL,

    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RentalPolicy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `holdHours` INTEGER NOT NULL DEFAULT 72,
    `depositMonths` INTEGER NOT NULL DEFAULT 1,
    `dueDays` INTEGER NOT NULL DEFAULT 5,
    `createdBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TenantProfile` ADD CONSTRAINT `TenantProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lease` ADD CONSTRAINT `Lease_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `TenantProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lease` ADD CONSTRAINT `Lease_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lease` ADD CONSTRAINT `Lease_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaseOccupant` ADD CONSTRAINT `LeaseOccupant_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MeterReading` ADD CONSTRAINT `MeterReading_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoicePayment` ADD CONSTRAINT `InvoicePayment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentProof` ADD CONSTRAINT `PaymentProof_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `InvoicePayment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceSettlement` ADD CONSTRAINT `InvoiceSettlement_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceSettlement` ADD CONSTRAINT `InvoiceSettlement_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `InvoicePayment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DepositEntry` ADD CONSTRAINT `DepositEntry_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Confirmed default policy; no users, rooms or transactions are seeded.
INSERT INTO `RentalPolicy` (`holdHours`, `depositMonths`, `dueDays`) VALUES (72, 1, 5);
