import { Controller, Get, HttpCode, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import AuthService from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import CustomResponse from 'src/structure/custom-response';

@Controller('auth')
export default class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  
    @Get('kakao/callback')
    @UseGuards(AuthGuard('kakao'))
    kakaoCallback(@Req() req): CustomResponse<any> {
      let response: CustomResponse<any>;
      if (req.user.is_signup) {
        response = new CustomResponse(HttpStatus.CREATED, HttpStatus[HttpStatus.CREATED], "회원가입 성공", {
          accessToken: req.user.accessToken,
          refreshToken: req.user.refreshToken,
        });
      } else {
        response = new CustomResponse(200, HttpStatus[HttpStatus.OK], "로그인 성공", {
          accessToken: req.user.accessToken,
          refreshToken: req.user.refreshToken,
        });
      }
      console.log("response: ", response);

      
      return response;
    }
  }
  