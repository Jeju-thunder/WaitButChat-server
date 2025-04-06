import { Server, Socket } from 'socket.io';
import { MessageBody, ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { PrismaService } from 'src/modules/prisma/prisma.service';

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

    constructor(private readonly prismaService: PrismaService) { }


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
        const chatRoom = await this.prismaService.chat_room.findUnique({
            where: { id: data.chatroom_id }
        });

        if (!chatRoom) {
            client.emit('chat', { message: '채팅방 조회 실패' });
            return;
        }

        // matching_id 기반의 익명 사용자 조회
        const match = await this.prismaService.match.findUnique({
            where: { id: data.matching_id },
            include: {
                anonymousMembers: true
            }
        });
        if (!match) {
            client.emit('chat', { message: '매칭 조회 실패' });
            return;
        }

        // 채팅 메시지 생성
        const chatMessage = await this.prismaService.chat.create({
            data: {
                chat_room_id: data.chatroom_id,
                created_by_anonymous_member_id: match.anonymousMembers.id,
                content: data.contents,
                created_at: new Date(),
                updated_at: new Date()
            }
        });
        // Send the message only to clients in the same room
        this.server.to(roomName).emit('chat', data);
    }

}