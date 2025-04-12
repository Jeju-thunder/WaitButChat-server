import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import PrismaModule from './modules/prisma/prisma.module';
import ChatModule from './chat/chat.module';
import { SchedulerService } from './scheduler/scheduler.service';
import QuestionModule from './question/question.module';
import AuthModule from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JWT_STRATEGY } from './auth/strategies/jwt.strategy';
import { MatchModule } from './websocket/match/match.module';
import { ChatModule as WebsocketChatModule } from './websocket/chat/chat.module';
import { MemberModule } from './member/member.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ChatModule,
    ScheduleModule.forRoot(),
    QuestionModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: JWT_STRATEGY }),
    MatchModule,
    WebsocketChatModule,
    MemberModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService, SchedulerService],
})
export class AppModule { }
