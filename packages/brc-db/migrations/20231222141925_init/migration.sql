-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('UNPAID', 'EXPIRED', 'COMPLETE') NOT NULL DEFAULT 'UNPAID',
    `receiveAddress` VARCHAR(191) NOT NULL,
    `claimId` INTEGER NULL,
    `amount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `paymentTxId` VARCHAR(191) NULL,
    `transferTxId` VARCHAR(191) NULL,
    `feeRate` INTEGER NOT NULL DEFAULT 0,

    INDEX `Order_claimId_fkey`(`claimId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Claim` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordinalAddress` VARCHAR(191) NOT NULL,
    `freeAmount` INTEGER NOT NULL DEFAULT 0,
    `claimedAmount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_claimId_fkey` FOREIGN KEY (`claimId`) REFERENCES `Claim`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
