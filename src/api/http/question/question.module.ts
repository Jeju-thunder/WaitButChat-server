import { Module } from "@nestjs/common";
import QuestionController from "./question.controller";
import QuestionService from "./question.service";
import { PrismaService } from "src/providers/prisma/prisma.service";
import { QuestionRepository } from "./question.repository";
@Module({
    controllers: [QuestionController],
    providers: [QuestionService, PrismaService, QuestionRepository],
})
export default class QuestionModule { }