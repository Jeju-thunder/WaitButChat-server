import { Controller, Get } from "@nestjs/common";
import QuestionService from "./question.service";

@Controller('question')
export default class QuestionController {
    constructor(private readonly questionService: QuestionService) { }

    @Get()
    async getQuestions() {
        return this.questionService.getQuestions();
    }
}