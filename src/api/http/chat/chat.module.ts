import { Module } from "@nestjs/common";
import ChatController from "./chat.controller";
import ChatService from "./chat.service";
import { PrismaService } from "src/providers/prisma/prisma.service";
import { ChatRepository } from "./chat.repository";
import { ChatAnalysisService } from "src/providers/analysis/chat-analysis.service";
@Module({
    controllers: [ChatController],
    providers: [ChatService, ChatRepository, PrismaService, ChatAnalysisService],
    exports: [ChatRepository]
})
export default class ChatModule { }