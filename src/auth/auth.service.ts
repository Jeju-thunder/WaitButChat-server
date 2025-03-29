import { JwtService } from '@nestjs/jwt';
import {
  member,
  PrismaClient,
} from "@prisma/client"
import { Profile } from 'passport-kakao';
import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class AuthService {
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.jwtExpiresIn = this.configService.get<string>("JWT_EXPIRES_IN") ?? "1h";
    this.jwtRefreshExpiresIn = this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "30d";
  }

  async handleKakaoUser(profile: Profile): Promise<any> {
    const { id, _json } = profile;
    const email = _json.kakao_account.email;
    const gender = _json.kakao_account.gender === 'male' ? 'M' : 'F';

    const user = await this.prismaService.member.findFirst({
      where: {
        kakao_id: Number(id),
      }
    });

    if (user) {
      return this.loginUser(user);
    } else {
      return this.registerUser(id, email, gender);
    }
  }

  // FIXME: 카카오 연동하지 않고 테스트를 위해서 사용
  async localSignup(kakaoId: string, email: string, gender: string): Promise<any> {
    if (!kakaoId || !email || !gender) {
      throw new UnprocessableEntityException('모든 파라미터(kakaoId, email, gender)가 필요합니다.');
    }
    const user = await this.prismaService.member.findUnique({
      where: {
        kakao_id: Number(kakaoId),
      }
    })
    if (user) {
      throw new BadRequestException("이미 존재하는 유저입니다.");
    }
    const newUser = await this.prismaService.member.create({
      data: {
        kakao_id: Number(kakaoId),
        email: email,
        gender: gender,
        provider: 'local',
        manner_status: 0,
        created_at: new Date(),
      },
    });
    return await this.localSignin(newUser.kakao_id.toString());
  }

  // FIXME: 카카오 연동하지 않고 테스트를 위해서 사용
  async localSignin(kakaoId: string): Promise<any> {
    if (!kakaoId) {
      throw new UnprocessableEntityException('모든 파라미터(kakaoId)가 필요합니다.');
    }
    const user = await this.prismaService.member.findFirst({
      where: {
        kakao_id: Number(kakaoId),
      },
    });

    if (!user) {
      throw new BadRequestException("존재하지 않는 유저입니다.");
    }

    return await this.loginUser(user);
  }

  private async loginUser(user: member): Promise<any> {
    const payload = { sub: user.id, kakaoId: Number(user.kakao_id) };
    return {
      isSignup: false,
      accessToken: this.jwtService.sign(payload, { expiresIn: this.jwtExpiresIn }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: this.jwtRefreshExpiresIn }),
    };
  }

  private async registerUser(kakaoId: string, email: string, gender: string): Promise<any> {
    const newUser = await this.prismaService.member.create({
      data: {
        kakao_id: Number(kakaoId),
        email: email,
        gender: gender,
        provider: 'kakao',
        manner_status: 0,
        created_at: new Date(),
      },
    });
    const payload = { sub: newUser.id, kakaoId: Number(newUser.kakao_id) };
    return {
      is_signup: true,
      accessToken: this.jwtService.sign(payload, { expiresIn: this.jwtExpiresIn }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: this.jwtRefreshExpiresIn }),
    };
  }

}
