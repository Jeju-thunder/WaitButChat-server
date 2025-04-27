import { Injectable } from "@nestjs/common";
import { member } from "@prisma/client";
import { PrismaService } from "src/providers/prisma/prisma.service";

@Injectable()
export class MemberRepository {
    constructor(private readonly prisma: PrismaService) { }

    async getMember(id: number): Promise<member | null> {
        return await this.prisma.member.findUnique({
            where: { id },
        });
    }

    async deleteMember(member: member, deleted_at: Date = new Date()): Promise<{ id: number, deleted_at: Date }> {
        await this.prisma.$transaction(async (tx) => {
            // 매칭된 채팅방에서 종료 처리
            await tx.match.updateMany({
                where: {
                    anonymousMembers: {
                        member_id: member.id
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
                where: { id: member.id },
                data: { deleted_at: deleted_at }
            });
        });
        return {
            id: member.id,
            deleted_at: deleted_at
        }
    }

}
