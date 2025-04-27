import { Module } from "@nestjs/common";
import PrismaModule from "src/providers/prisma/prisma.module";
import { ReportController } from "./report.controller";
import { ReportService } from "./report.service";
import { MemberRepository } from "../member/member.repository";
import { ReportRepository } from "./report.repoisotry";
import { ChatRepository } from "../chat/chat.repository";
@Module({
    imports: [PrismaModule],
    controllers: [ReportController],
    providers: [ReportService, ReportRepository, MemberRepository, ChatRepository],
})
export class ReportModule { }