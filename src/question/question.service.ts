import { PrismaService } from "src/modules/prisma/prisma.service";
import GetQuestionResponse from "./dto/response/get-question.response.dto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import GetAnswerResponse from "./dto/response/get-answer.response.dto";
import CreateAnswerRequest from "./dto/request/create-answer-request.dto";
import CreateAnswerResponse from "./dto/response/create-answer-response.dto";
import { member } from '@prisma/client';


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
        // 한국 자정 시간을 UTC로 변환
        const kstMidnightInUTC = new Date(Date.UTC(year, month, day, 15 - 24, 0, 0, 0));


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

    async getAnswerByQuestionId(member: member, id: number): Promise<GetAnswerResponse> {
        const answer = await this.prisma.answer.findFirst({
            where: { question_id: id, member_id: member.id }
        });

        if (!answer) {
            throw new NotFoundException('답변을 찾을 수 없습니다.');
        }

        // FIXME: 지금은 true, false만 받지만, 추후 다른 값을 받을 수 있음.
        // content가 true, false인지 확인
        if (answer.content !== "true" && answer.content !== "false") {
            throw new BadRequestException("저장된 답변이 긍정, 부정의 형태가 아닙니다.");
        }
        return {
            id: answer.id,
            answer: answer.content === "true"
        };
    }

    async createAnswer(member: member, id: number, requestBody: CreateAnswerRequest): Promise<CreateAnswerResponse> {
        // 이전에 답변이 있는지 확인
        const previousAnswer = await this.prisma.answer.findFirst({
            where: { question_id: id, member_id: member.id }
        });
        if (previousAnswer) {
            throw new BadRequestException("이미 답변을 제출했습니다.");
        }

        // content가 true, false인지 확인
        if (requestBody.content !== "true" && requestBody.content !== "false") {
            throw new BadRequestException("답변은 true 또는 false만 가능합니다.");
        }

        const answer = await this.prisma.answer.create({
            data: {
                question_id: id,
                content: requestBody.content,
                member_id: member.id,
                created_at: new Date(),
                updated_at: new Date()
            }
        });

        return {
            id: answer.id
        };
    }

}