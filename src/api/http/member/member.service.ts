import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/providers/prisma/prisma.service";
import { member } from "@prisma/client";
import { GetMemberResponseDto } from "./dto/response/get-member.response.dto";
import { DeleteMemberResponseDto } from "./dto/response/delete-member.response.dto";
import { MemberRepository } from "./member.repository";

@Injectable()
export class MemberService {
    constructor(private readonly memberRepository: MemberRepository) { }

    getMember(member: member, id: number): GetMemberResponseDto {
        if (member.id !== id) {
            throw new ForbiddenException("본인만 조회할 수 있습니다.");
        }

        return {
            id: member.id,
            provider: member.provider,
            email: member.email,
            gender: member.gender,
        }
    }

    async deleteMember(member: member, id: number, deleted_at: Date = new Date()): Promise<DeleteMemberResponseDto> {
        if (member.id !== id) {
            throw new ForbiddenException("본인만 탈퇴할 수 있습니다.");
        }

        await this.memberRepository.deleteMember(member, deleted_at);

        return {
            id: member.id,
            deleted_at: deleted_at.toISOString()
        }
    }


}
