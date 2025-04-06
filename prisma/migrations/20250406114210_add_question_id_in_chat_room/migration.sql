-- AlterTable
ALTER TABLE "chat_room" ADD COLUMN     "question_id" INTEGER;

-- AddForeignKey
ALTER TABLE "chat_room" ADD CONSTRAINT "chat_room_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
