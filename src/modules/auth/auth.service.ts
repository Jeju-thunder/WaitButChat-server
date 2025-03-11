import { JwtService } from '@nestjs/jwt';
import {
    member,
    PrismaClient,
} from "@prisma/client"
import { PrismaService } from '../prisma/prisma.service';
import { Profile } from 'passport-kakao';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async validateKakaoUser(profile: Profile): Promise<any> {

    console.log("profile: ", profile);
    const { id, _json } = profile;
    const email = _json.kakao_account.email;

    const user = await this.prismaService.member.findFirst({
        where: {
            kakao_id: BigInt(id),
        }
    });
    console.log("user: ", user);

    // 없으면 회원가입 진행
    if (!user) {
        const newUser = await this.prismaService.member.create({
            data: {
                kakao_id: BigInt(id),
                email: email,
                ci: '',
                gender: '',
                provider: 'kakao',
                manner_status: 0,
                auth_token: '',
                created_at: new Date(),
            },
        });
        console.log("newUser: ", newUser);
        const payload = { sub: newUser.id, kakaoId: Number(newUser.kakao_id) }; // Convert kakao_id from BigInt to number
        return {
          accessToken: this.jwtService.sign(payload),
          user: {
            ...newUser,
            kakao_id: Number(newUser.kakao_id),  // BigInt를 string으로 변환
          },
        };
      }
    // 동일 이메일 접근 제한으로 처리
    const payload = { sub: user.id, kakaoId: Number(user.kakao_id) }; // Convert kakao_id from BigInt to number
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        ...user,
        kakao_id: Number(user.kakao_id),  // BigInt를 string으로 변환
      },
    };
  }

  private generateAccessToken(user: member): string {
    const payload = {
      userId: user.id,
    };
    
    return this.jwtService.sign(payload);
  }

  // async generateRefreshToken(user: User): Promise<string> {
  //   const payload = {
  //     userId: user.id,
  //   };
  //
  //   const refreshToken = this.jwtService.sign(payload, {
  //     secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
  //     expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN"),
  //   });
  //
  //   const saltOrRounds = 10;
  //   const currentRefreshToken = await bcrypt.hash(refreshToken, saltOrRounds);
  //
  //   await this.userRepository.setCurrentRefreshToken(
  //     payload.userId,
  //     currentRefreshToken,
  //   );
  //
  //   return refreshToken;
  // }
}
