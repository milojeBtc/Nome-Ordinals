/*
  Warnings:

  - Added the required column `expiresAt` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` ADD COLUMN `expiresAt` DATETIME(3) NOT NULL;
