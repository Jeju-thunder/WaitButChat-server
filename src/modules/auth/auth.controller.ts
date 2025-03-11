import { Controller, Get, HttpCode, Req, Res, UseGuards } from '@nestjs/common';
import AuthService from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export default class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
    @Get('kakao')
    @UseGuards(AuthGuard('kakao'))
    kakaoLogin() {
      return { message: 'Redirecting to Kakao login...' };
    }
  
    @Get('kakao/callback')
    @UseGuards(AuthGuard('kakao'))
    kakaoCallback(@Req() req) {
      console.log("req.user: ", req.user);
      
      return req.user;
    }
  }
  