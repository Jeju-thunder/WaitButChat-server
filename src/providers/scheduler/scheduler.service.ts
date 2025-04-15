import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/providers/prisma/prisma.service';

@Injectable()
export class SchedulerService {
    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
        timeZone: 'Asia/Seoul'
    })
    async handleDailyCron() {
        const today = new Date();
        // 현재 한국 날짜 구하기
        const koreaDate = new Date(today.getTime() + 9 * 60 * 60 * 1000);
        const year = koreaDate.getUTCFullYear();
        const month = koreaDate.getUTCMonth();
        const day = koreaDate.getUTCDate();
        // 한국 자정 시간을 UTC로 변환
        const kstMidnightInUTC = new Date(Date.UTC(year, month, day, 15 - 24, 0, 0, 0));
        // 오늘날짜 질문이 있는지 확인
        const todayQuestion = await this.prisma.question.findFirst({
            where: {
                used_at: kstMidnightInUTC
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
                    data: { used_at: kstMidnightInUTC }
                });
            } else {
                console.log("남은 질문이 없습니다.");
            }
        }
    }
}