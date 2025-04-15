import { Body, Controller, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ReportService } from "./report.service";
import { AuthGuard } from "@nestjs/passport";
import { JWT_STRATEGY } from "../auth/strategies/jwt.strategy";
import { CreateReportDto } from "./dto/request/create-report.request.dto";
import { GetMember } from "src/interface/decorator/get-member.decorator";
import { member } from "@prisma/client";
import CustomResponse from "src/interface/custom-response";

@Controller("reports")
@UseGuards(AuthGuard(JWT_STRATEGY))
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    @Post()
    async createReport(@GetMember() member: member, @Body() body: CreateReportDto): Promise<CustomResponse<{ id: number }>> {
        const response = await this.reportService.createReport(member, body);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "신고 처리 성공", response);
    }
}
