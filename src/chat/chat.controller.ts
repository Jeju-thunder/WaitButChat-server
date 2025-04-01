import { Controller, Get, HttpStatus, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import ChatService from "./chat.service";
import GetChatsResponse from "./dto/response/get-chats-response.dto";
import CustomResponse from "src/structure/custom-response";
import GetChatRoomsResponse from "./dto/response/get-chatrooms-response.dto";
import { GetMember } from "src/decorator/get-member.decorator";
import { member } from "@prisma/client";
import { AuthGuard } from "@nestjs/passport";
import { JWT_STRATEGY } from "src/auth/strategies/jwt.strategy";

@Controller('chatrooms')
@UseGuards(AuthGuard(JWT_STRATEGY))
export default class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get("")
    async getChatRooms(@GetMember() member: member): Promise<CustomResponse<GetChatRoomsResponse>> {
        const data = await this.chatService.getChatRooms(member);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "채팅방 목록 조회 성공", data);
    }

    @Get(":id/chat")
    async getChats(@GetMember() member: member, @Param("id", ParseIntPipe) id: number): Promise<CustomResponse<GetChatsResponse>> {
        const data = await this.chatService.getChats(member, id);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "채팅 목록 조회 성공", data);
    }
}
