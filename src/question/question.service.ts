import { PrismaService } from "src/modules/prisma/prisma.service";
import GetQuestionResponse from "./dto/get-question.response.dto";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export default class QuestionService {
    constructor(private readonly prisma: PrismaService) { }

    async getQuestions(formattedDate: Date = new Date()): Promise<GetQuestionResponse> {
        const today = new Date();
        const kstToday = new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate(),
            -9, // UTC+9 기준 자정은 UTC-9시
            0,
            0,
            0
        ));
        const questions = await this.prisma.question.findMany({
            where: {
                used_at: kstToday
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