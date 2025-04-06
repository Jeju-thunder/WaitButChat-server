/*
  Warnings:

  - Made the column `question_id` on table `chat_room` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "chat_room" DROP CONSTRAINT "chat_room_question_id_fkey";

-- AlterTable
ALTER TABLE "chat_room" ALTER COLUMN "question_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "chat_room" ADD CONSTRAINT "chat_room_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
