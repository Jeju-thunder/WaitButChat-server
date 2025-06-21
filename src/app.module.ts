import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import PrismaModule from './providers/prisma/prisma.module';
import { SchedulerService } from './providers/scheduler/scheduler.service';
import QuestionModule from './api/http/question/question.module';
import { PassportModule } from '@nestjs/passport';
import { MatchModule } from './api/socket/match/match.module';
import { ChatSocketModule } from './api/socket/chat/chat-socket.module';
import { MemberModule } from './api/http/member/member.module';
import { ReportModule } from './api/http/report/report.module';
import { JWT_STRATEGY } from './api/http/auth/strategies/jwt.strategy';
import AuthModule from './api/http/auth/auth.module';
import ChatModule from './api/http/chat/chat.module';
import { AppController } from './api/app.controller';
import { ChatAnalysisModule } from './providers/analysis/chat-analysis.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    QuestionModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: JWT_STRATEGY }),
    MatchModule,
    ChatModule,
    ChatSocketModule,
    MemberModule,
    ReportModule,
    ChatAnalysisModule,
  ],
  controllers: [AppController],
  providers: [SchedulerService],
})
export class AppModule { }
