import { Server, Socket } from 'socket.io';
import { MessageBody, ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { ChatRepository } from 'src/api/http/chat/chat.repository';
import { CreateChatDto } from 'src/api/http/chat/dto/request/create-chat.dto';

interface ChatMessage {
    chatroom_id: number;
    matching_id: number;
    contents: string;
    created_by: string;
}

@WebSocketGateway({
    namespace: '/socket/chat',
    transports: ['websocket'],
    cors: {
        origin: '*',
    },
})
export class ChatGateway {
    @WebSocketServer()
    server: Server;
    constructor(
        private readonly prismaService: PrismaService,
        private readonly chatRepository: ChatRepository
    ) { }


    @SubscribeMessage('join')
    handleJoin(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { chatroom_id: number }
    ) {
        const roomName = `room_${data.chatroom_id}`;
        client.join(roomName);
    }

    @SubscribeMessage('leave')
    handleLeave(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { chatroom_id: number }
    ) {
        const roomName = `room_${data.chatroom_id}`;
        client.leave(roomName);
    }

    @SubscribeMessage('chat')
    async handleChat(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: ChatMessage
    ) {
        const roomName = `room_${data.chatroom_id}`;

        // 채팅방 조회
        const chatRoom = await this.chatRepository.getChatRoomsById(data.chatroom_id);

        if (!chatRoom) {
            client.emit('chat', { message: '채팅방 조회 실패' });
            return;
        }

        // matching_id 기반의 익명 사용자 조회
        const match = await this.chatRepository.getMatchIncludeAnonymousMember(data.matching_id);
        if (!match) {
            client.emit('chat', { message: '매칭 조회 실패' });
            return;
        }

        // 채팅 메시지 생성
        const createChatDto: CreateChatDto = {
            chat_room_id: data.chatroom_id,
            content: data.contents,
        }
        const chatMessage = await this.chatRepository.createChat(createChatDto, match.anonymousMembers.id);

        // 채팅방 채팅 메시지 전송
        this.server.to(roomName).emit('chat', data);
    }

}