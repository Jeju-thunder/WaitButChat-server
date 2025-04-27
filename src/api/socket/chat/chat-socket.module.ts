import { Module } from '@nestjs/common';
import { ChatSocketGateway } from './chat-socket.gateway';
import ChatModule from 'src/api/http/chat/chat.module';

@Module({
    providers: [ChatSocketGateway],
    imports: [ChatModule],
})
export class ChatSocketModule { } 