import { Controller, Delete, Get, HttpStatus, Param, ParseArrayPipe, ParseIntPipe, Post, Query, UseGuards } from "@nestjs/common";
import ChatService from "./chat.service";
import GetChatsResponse from "./dto/response/get-chats-response.dto";
import CustomResponse from "src/interface/custom-response";
import GetChatRoomsResponse from "./dto/response/get-chatrooms-response.dto";
import { GetMember } from "src/interface/decorator/get-member.decorator";
import { member } from "@prisma/client";
import { AuthGuard } from "@nestjs/passport";
import { JWT_STRATEGY } from "../auth/strategies/jwt.strategy";
import { GetChatAnalysisListResponse } from "./dto/response/get-chat-analysis-response.dto";
import { CreateChatAnalysisResponse } from "./dto/response/create-chat-analysis-response.dto";

@Controller('chatrooms')
@UseGuards(AuthGuard(JWT_STRATEGY))
export default class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get("")
    async getChatRooms(@GetMember() member: member): Promise<CustomResponse<GetChatRoomsResponse>> {
        const data = await this.chatService.getChatRooms(member);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "채팅방 목록 조회 성공", data);
    }

    @Delete("")
    async deleteChatRooms(@GetMember() member: member, @Query("ids", new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[]): Promise<CustomResponse<{}>> {
        await this.chatService.deleteChatRooms(member, ids);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "채팅방 삭제 성공", {});
    }

    @Get(":id/chat")
    async getChats(@GetMember() member: member, @Param("id", ParseIntPipe) id: number): Promise<CustomResponse<GetChatsResponse>> {
        const data = await this.chatService.getChats(member, id);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "채팅 목록 조회 성공", data);
    }

    @Get(":id/chat-analysis")
    async getChatAnalysis(@GetMember() member: member, @Param("id", ParseIntPipe) id: number): Promise<CustomResponse<GetChatAnalysisListResponse>> {
        const data = await this.chatService.getChatAnalysis(member, id);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "채팅 분석 조회 성공", data);
    }

    @Post(":id/chat-analysis")
    async createChatAnalysis(@GetMember() member: member, @Param("id", ParseIntPipe) id: number): Promise<CustomResponse<CreateChatAnalysisResponse>> {
        const data = await this.chatService.createChatAnalysis(member, id);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "채팅 분석 생성 성공", data);
    }
}
