-- CreateTable
CREATE TABLE "anonymous_members_chat_analysis" (
    "id" SERIAL NOT NULL,
    "anonymous_members_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ,
    "analysis_result" JSONB NOT NULL,

    CONSTRAINT "anonymous_members_chat_analysis_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "anonymous_members_chat_analysis" ADD CONSTRAINT "anonymous_members_chat_analysis_anonymous_members_id_fkey" FOREIGN KEY ("anonymous_members_id") REFERENCES "anonymous_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
