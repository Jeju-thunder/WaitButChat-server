import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { member } from "@prisma/client";
import { GetMemberResponseDto } from "./dto/response/get-member.response.dto";

@Injectable()
export class MemberService {
    constructor(private readonly prisma: PrismaService) { }

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


}
