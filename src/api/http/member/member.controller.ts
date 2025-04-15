import { Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import { MemberService } from "./member.service";
import { GetMember } from "src/interface/decorator/get-member.decorator";
import { AuthGuard } from "@nestjs/passport";
import { JWT_STRATEGY } from "../auth/strategies/jwt.strategy";
import { member } from "@prisma/client";
import CustomResponse from "src/interface/custom-response";
import { GetMemberResponseDto } from "./dto/response/get-member.response.dto";
import { DeleteMemberResponseDto } from "./dto/response/delete-member.response.dto";
@Controller("members")
@UseGuards(AuthGuard(JWT_STRATEGY))
export class MemberController {
    constructor(private readonly memberService: MemberService) { }

    @Get(":id")
    getMember(@GetMember() member: member, @Param("id", ParseIntPipe) id: number): CustomResponse<GetMemberResponseDto> {
        const data = this.memberService.getMember(member, id);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "회원 조회 성공", data);
    }

    @Delete(":id")
    async deleteMember(@GetMember() member: member, @Param("id", ParseIntPipe) id: number): Promise<CustomResponse<DeleteMemberResponseDto>> {
        const response = await this.memberService.deleteMember(member, id);
        return new CustomResponse(200, HttpStatus[HttpStatus.OK], "회원 탈퇴 성공", response);
    }


}
