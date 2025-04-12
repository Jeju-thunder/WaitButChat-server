import { Controller, Get, HttpStatus, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import { MemberService } from "./member.service";
import { GetMember } from "src/decorator/get-member.decorator";
import { AuthGuard } from "@nestjs/passport";
import { JWT_STRATEGY } from "src/auth/strategies/jwt.strategy";
import { member } from "@prisma/client";
import CustomResponse from "src/structure/custom-response";
import { GetMemberResponseDto } from "./dto/response/get-member.response.dto";
@Controller("members")
@UseGuards(AuthGuard(JWT_STRATEGY))
export class MemberController {
    constructor(private readonly memberService: MemberService) { }

    @Get(":id")
    getMember(@GetMember() member: member, @Param("id", ParseIntPipe) id: number): CustomResponse<GetMemberResponseDto> {
        const data = this.memberService.getMember(member, id);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "회원 조회 성공", data);
    }


}
