import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import QuestionService from "./question.service";
import { JWT_STRATEGY } from "../auth/strategies/jwt.strategy";
import { AuthGuard } from "@nestjs/passport";
import CustomResponse from "src/interface/custom-response";
import GetQuestionResponse from "./dto/response/get-question.response.dto";
import GetAnswerResponse from "./dto/response/get-answer.response.dto";
import CreateAnswerRequest from "./dto/request/create-answer-request.dto";
import CreateAnswerResponse from "./dto/response/create-answer-response.dto";
import { GetMember } from "src/interface/decorator/get-member.decorator";
import { member } from '@prisma/client';

@Controller('question')
@UseGuards(AuthGuard(JWT_STRATEGY))
export default class QuestionController {
    constructor(private readonly questionService: QuestionService) { }

    @Get()
    async getQuestions(): Promise<CustomResponse<GetQuestionResponse>> {
        const data = await this.questionService.getQuestions();
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "OK", data);
    }

    @Get(":id/answer")
    async getAnswer(@GetMember() member: member, @Param("id", ParseIntPipe) id: number): Promise<CustomResponse<GetAnswerResponse>> {
        const data = await this.questionService.getAnswerByQuestionId(member, id);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "OK", data);
    }

    @Post(":id/answer")
    async postAnswer(@GetMember() member: member, @Param("id", ParseIntPipe) id: number, @Body() requestBody: CreateAnswerRequest): Promise<CustomResponse<CreateAnswerResponse>> {
        const data = await this.questionService.createAnswer(member, id, requestBody);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "OK", data);
    }
}