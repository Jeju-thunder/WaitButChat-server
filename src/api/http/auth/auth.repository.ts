import { Injectable } from "@nestjs/common";
import { member, register_blacklist } from "@prisma/client";
import { PrismaService } from "src/providers/prisma/prisma.service";
import { CreateMemberDto } from "./dto/request/create-member.dto";

@Injectable()
export class AuthRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findMemberByKakaoId(kakaoId: number): Promise<member | null> {
        return await this.prisma.member.findFirst({
            where: {
                kakao_id: kakaoId
            }
        })
    }

    async findBlacklistByEmail(email: string, rejoinBlockDate: Date): Promise<register_blacklist | null> {
        return await this.prisma.register_blacklist.findFirst({
            where: {
                email: email,
                created_at: {
                    gte: rejoinBlockDate
                }
            }
        })
    }

    async createMember(member: CreateMemberDto) {
        return await this.prisma.member.create({
            data: member
        })
    }

}
