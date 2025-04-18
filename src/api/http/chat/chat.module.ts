import { Module } from "@nestjs/common";
import ChatController from "./chat.controller";
import ChatService from "./chat.service";
import { PrismaService } from "src/providers/prisma/prisma.service";

@Module({
    controllers: [ChatController],
    providers: [ChatService, PrismaService],
})
export default class ChatModule { }