import { Module } from "@nestjs/common";
import PrismaModule from "src/providers/prisma/prisma.module";
import { MemberController } from "./member.controller";
import { MemberService } from "./member.service";

@Module({
    imports: [PrismaModule],
    controllers: [MemberController],
    providers: [MemberService],
})
export class MemberModule { }