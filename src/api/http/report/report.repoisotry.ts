import { report } from "@prisma/client";
import { PrismaService } from "src/providers/prisma/prisma.service";
import { CreateReportDto } from "./dto/request/create-report.request.dto";

export class ReportRepository {
    constructor(private readonly prisma: PrismaService) { }

    async getReportByContent(reportedMemberId: number, reportMemberId: number, chatRoomId: number): Promise<report | null> {
        return await this.prisma.report.findFirst({
            where: {
                reported_member_id: reportedMemberId,
                report_member_id: reportMemberId,
                chat_room_id: chatRoomId,
            },
        });
    }

    async createReport(dto: CreateReportDto, created_at: Date = new Date()): Promise<report> {
        return await this.prisma.report.create({
            data: {
                reported_member_id: dto.reportedUserId,
                report_member_id: dto.reportUserId,
                chat_room_id: dto.chatroomId,
                reason: dto.reason,
                created_at,
            },
        });
    }
}