import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/providers/prisma/prisma.service";
import { CreateReportDto } from "./dto/request/create-report.request.dto";
import { member } from "@prisma/client";
import { ReportRepository } from "./report.repoisotry";
import { MemberRepository } from "../member/member.repository";
import { ChatRepository } from "../chat/chat.repository";

@Injectable()
export class ReportService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly reportRepository: ReportRepository,
        private readonly memberRepository: MemberRepository,
        private readonly chatRepository: ChatRepository
    ) { }

    async createReport(member: member, dto: CreateReportDto): Promise<{ id: number }> {

        if (member.id !== dto.reportUserId) {
            throw new ForbiddenException("본인만 신고할 수 있습니다.");
        }

        // 제보자, 신고자 조회
        const reportedMember = await this.memberRepository.getMember(dto.reportedUserId);
        const reportMember = await this.memberRepository.getMember(dto.reportUserId);

        if (!reportedMember || !reportMember) {
            throw new NotFoundException("존재하지 않는 회원입니다.");
        }

        // 채팅방 조회
        const chatRoom = await this.chatRepository.getChatRoomsByIdForMember(member.id, dto.chatroomId);

        if (!chatRoom) {
            throw new NotFoundException("존재하지 않는 채팅방입니다.");
        }

        // 신고 처리 중복 여부 확인
        const existingReport = await this.reportRepository.getReportByContent(dto.reportedUserId, dto.reportUserId, dto.chatroomId);

        if (existingReport) {
            throw new BadRequestException("이미 신고 처리된 대상입니다.");
        }

        // 신고 처리
        const report = await this.reportRepository.createReport(dto);

        return {
            id: report.id,
        };
    }
}