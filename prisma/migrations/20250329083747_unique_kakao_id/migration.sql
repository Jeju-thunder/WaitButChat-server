/*
  Warnings:

  - A unique constraint covering the columns `[kakao_id]` on the table `member` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "member_kakao_id_key" ON "member"("kakao_id");
