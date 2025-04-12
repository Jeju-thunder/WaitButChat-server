import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { member } from "@prisma/client";
import { GetMemberResponseDto } from "./dto/response/get-member.response.dto";
import { DeleteMemberResponseDto } from "./dto/response/delete-member.response.dto";

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

    async deleteMember(member: member, id: number): Promise<DeleteMemberResponseDto> {
        if (member.id !== id) {
            throw new ForbiddenException("본인만 탈퇴할 수 있습니다.");
        }

        const deleted_at = new Date();
        await this.prisma.$transaction(async (tx) => {
            // 매칭된 채팅방에서 종료 처리
            await tx.match.updateMany({
                where: {
                    anonymousMembers: {
                        member_id: id
                    },
                    terminated_at: null
                },
                data: {
                    terminated_at: new Date()
                }
            })

            // register_blacklist 추가
            await tx.register_blacklist.create({
                data: {
                    email: member.email,
                    created_at: new Date()
                }
            })

            await tx.member.update({
                where: { id },
                data: { deleted_at: new Date() }
            });
        });

        return {
            id: member.id,
            deleted_at: deleted_at.toISOString()
        }
    }


}
