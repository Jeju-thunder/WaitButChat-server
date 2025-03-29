import { Controller, Get, HttpCode, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import AuthService from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import CustomResponse from 'src/structure/custom-response';
import { JWT_STRATEGY } from './strategies/jwt.strategy';

@Controller('auth')
export default class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  kakaoCallback(@Req() req): CustomResponse<any> {
    const tokens = {
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
    }
    let response: CustomResponse<any>;
    if (req.user.is_signup) {
      return new CustomResponse(HttpStatus.CREATED, HttpStatus[HttpStatus.CREATED], "회원가입 성공", tokens);
    } else {
      return new CustomResponse(HttpStatus.OK, HttpStatus[HttpStatus.OK], "로그인 성공", tokens);
    }
  }
}
