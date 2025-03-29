import { Controller, Get, UseGuards } from "@nestjs/common";
import QuestionService from "./question.service";
import { JWT_STRATEGY } from "src/auth/strategies/jwt.strategy";
import { AuthGuard } from "@nestjs/passport";

@Controller('question')
@UseGuards(AuthGuard(JWT_STRATEGY))
export default class QuestionController {
    constructor(private readonly questionService: QuestionService) { }

    @Get()
    async getQuestions() {
        return this.questionService.getQuestions();
    }
}