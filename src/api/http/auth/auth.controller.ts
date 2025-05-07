import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import AuthService from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import CustomResponse from 'src/interface/custom-response';

@Controller('auth')
export default class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  kakaoCallback(@Req() req): CustomResponse<any> {
    const userInfos = {
      userId: req.user.userId,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
    }
    if (req.user.isSignup) {
      return new CustomResponse(HttpStatus.CREATED, HttpStatus[HttpStatus.CREATED], "회원가입 성공", userInfos);
    } else {
      return new CustomResponse(HttpStatus.OK, HttpStatus[HttpStatus.OK], "로그인 성공", userInfos);
    }
  }

  @Post("local/signup")
  async localSignup(@Body() body: { kakaoId: string, email: string, gender: string }): Promise<CustomResponse<any>> {
    const response = await this.authService.localSignup(body.kakaoId, body.email, body.gender);
    const userInfos = {
      userId: response.userId,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    }
    return new CustomResponse(HttpStatus.CREATED, HttpStatus[HttpStatus.CREATED], "회원가입 성공", userInfos);
  }

  @Post("local/signin")
  async localSignin(@Body() body: { kakaoId: string }): Promise<CustomResponse<any>> {
    const response = await this.authService.localSignin(body.kakaoId);
    const userInfos = {
      userId: response.userId,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    }
    return new CustomResponse(HttpStatus.OK, HttpStatus[HttpStatus.OK], "로그인 성공", userInfos);
  }

}
