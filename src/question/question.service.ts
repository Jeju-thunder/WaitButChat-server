import { PrismaService } from "src/modules/prisma/prisma.service";
import GetQuestionResponse from "./dto/get-question.response.dto";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export default class QuestionService {
    constructor(private readonly prisma: PrismaService) { }

    async getQuestions(formattedDate: string = new Date().toISOString().split('T')[0]): Promise<GetQuestionResponse> {
        const questions = await this.prisma.question.findMany({
            where: {
                used_at: new Date(formattedDate)
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