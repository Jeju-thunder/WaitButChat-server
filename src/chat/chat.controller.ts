import { Controller, Get, HttpStatus, Param, ParseIntPipe } from "@nestjs/common";
import ChatService from "./chat.service";
import GetChatsResponse from "./dto/response/get-chats-response.dto";
import CustomResponse from "src/structure/custom-response";
import GetChatRoomsResponse from "./dto/response/get-chatrooms-response.dto";

@Controller('chatrooms')
export default class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get("")
    async getChatRooms(): Promise<CustomResponse<GetChatRoomsResponse>> {
        // FIXME: DUMMY ID
        const dummyId = 1
        const data = await this.chatService.getChatRooms(dummyId);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "채팅방 목록 조회 성공", data);
    }

    @Get(":id/chat")
    async getChats(@Param("id", ParseIntPipe) id: number): Promise<CustomResponse<GetChatsResponse>> {
        const data = await this.chatService.getChats(id);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "채팅 목록 조회 성공", data);
    }
}
