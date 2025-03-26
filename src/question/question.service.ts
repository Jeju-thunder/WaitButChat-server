import { PrismaService } from "src/modules/prisma/prisma.service";
import GetQuestionResponse from "./dto/get-question.response.dto";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export default class QuestionService {
    constructor(private readonly prisma: PrismaService) { }

    async getQuestions(formattedDate: Date = new Date()): Promise<GetQuestionResponse> {
        const today = new Date();
        // 현재 한국 날짜 구하기
        const koreaDate = new Date(today.getTime() + 9 * 60 * 60 * 1000);
        const year = koreaDate.getUTCFullYear();
        const month = koreaDate.getUTCMonth();
        const day = koreaDate.getUTCDate();
        console.log("koreaDate: ", koreaDate);
        // 한국 자정 시간을 UTC로 변환
        const kstMidnightInUTC = new Date(Date.UTC(year, month, day, 15 - 24, 0, 0, 0));
        console.log("kstMidnightInUTC: ", kstMidnightInUTC);


        const questions = await this.prisma.question.findMany({
            where: {
                used_at: kstMidnightInUTC
            },
            include: {
                answers: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        if (questions.length === 0) {
            throw new NotFoundException('오늘의 질문을 찾을 수 없습니다.');
        }
        // 하나의 map으로 질문 정보를 변환하면서 참여자 수를 계산
        let participantCount = 0;
        const questionsResponse = questions.map((question) => {
            participantCount += question.answers.length;
            return {
                id: question.id,
                title: question.title,
                content: question.content
            };
        });

        return {
            questions: questionsResponse,
            participantCount
        };
    }


}