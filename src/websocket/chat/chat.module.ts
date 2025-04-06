import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import PrismaModule from 'src/modules/prisma/prisma.module';

@Module({
    providers: [ChatGateway],
    imports: [PrismaModule],
})
export class ChatModule { } 