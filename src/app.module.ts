import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import PrismaModule from './modules/prisma/prisma.module';
import ChatModule from './chat/chat.module';
import { SchedulerService } from './scheduler/scheduler.service';
import QuestionModule from './question/question.module';
@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ChatModule,
    ScheduleModule.forRoot(),
    QuestionModule
  ],
  controllers: [AppController],
  providers: [AppService, SchedulerService],
})
export class AppModule { }
