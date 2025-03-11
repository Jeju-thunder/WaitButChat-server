/*
  Warnings:

  - Added the required column `kakao_id` to the `member` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "member" ADD COLUMN     "kakao_id" INTEGER NOT NULL;
