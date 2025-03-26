import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class SchedulerService {
    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyCron() {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD 형태로 변환

        // 오늘날짜 질문이 있는지 확인
        const todayQuestion = await this.prisma.question.findFirst({
            where: {
                used_at: new Date(formattedDate)
            }
        });

        // 오늘날짜 질문이 없는 경우, 새 질문 할당
        if (!todayQuestion) {
            const notUsedQuestion = await this.prisma.question.findFirst({
                where: {
                    used_at: null
                },
                orderBy: {
                    id: 'asc'
                }
            });

            if (notUsedQuestion) {
                await this.prisma.question.update({
                    where: { id: notUsedQuestion.id },
                    data: { used_at: new Date(formattedDate) }
                });
            } else {
                console.log("남은 질문이 없습니다.");
            }
        }
    }
}