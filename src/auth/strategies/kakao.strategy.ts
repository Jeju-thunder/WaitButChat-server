import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import AuthService from '../auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService) {
    super({
      clientID: configService.get('KAKAO_CLIENT_ID') || '', // Ensure clientID is a string
      clientSecret: '', // You may want to retrieve this from config as well
      callbackURL: `${configService.get('FRONTEND_URL')}/kakao/redirect`,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = await this.authService.handleKakaoUser(profile);
    return user;
  }

}
