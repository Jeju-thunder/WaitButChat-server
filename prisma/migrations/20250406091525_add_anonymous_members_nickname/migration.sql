/*
  Warnings:

  - Added the required column `nickname` to the `anonymous_members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "anonymous_members" ADD COLUMN     "nickname" TEXT NOT NULL;
