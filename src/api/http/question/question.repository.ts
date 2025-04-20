import { question, answer } from "@prisma/client";
import { QuestionWithRelationsForGetQuestions } from "src/interface/query-type";
import { PrismaService } from "src/providers/prisma/prisma.service";
import CreateAnswerRequest from "./dto/request/create-answer-request.dto";

export class QuestionRepository {
    constructor(private readonly prisma: PrismaService) { }

    async getQuestion(formattedDate: Date = new Date()): Promise<QuestionWithRelationsForGetQuestions[]> {
        const questions = await this.prisma.question.findMany({
            where: {
                used_at: formattedDate
            },
            include: {
                answers: true
            },
            orderBy: {
                id: 'asc'
            }
        });
        return questions;
    }

    async getAnswer(memberId: number, questionId: number): Promise<answer | null> {
        const answer = await this.prisma.answer.findFirst({
            where: {
                member_id: memberId,
                question_id: questionId
            }
        });
        return answer;
    }

    async createAnswer(memberId: number, questionId: number, requestBody: CreateAnswerRequest): Promise<answer> {
        const answer = await this.prisma.answer.create({
            data: {
                question_id: questionId,
                content: requestBody.content,
                member_id: memberId,
                created_at: new Date(),
                updated_at: new Date()
            }
        });
        return answer;
    }
}