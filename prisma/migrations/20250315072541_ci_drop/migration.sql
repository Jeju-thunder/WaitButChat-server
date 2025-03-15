/*
  Warnings:

  - You are about to drop the column `auth_token` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `ci` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `ci` on the `register_blacklist` table. All the data in the column will be lost.
  - Added the required column `email` to the `register_blacklist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "member" DROP COLUMN "auth_token",
DROP COLUMN "ci";

-- AlterTable
ALTER TABLE "register_blacklist" DROP COLUMN "ci",
ADD COLUMN     "email" TEXT NOT NULL;
