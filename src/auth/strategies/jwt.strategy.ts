import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ExtractJwt,
  Strategy,
} from "passport-jwt";
import {
  PassportStrategy,
} from "@nestjs/passport";
import {
  ConfigService,
} from "@nestjs/config";
import { member } from '@prisma/client';

export const JWT_STRATEGY = "jwt-strategy";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
  constructor(
    readonly configService: ConfigService,
    private readonly prismaService: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET") ?? "secret",
    });
  }

  async validate(payload: { sub: string }): Promise<member> {
    const user = await this.prismaService.member.findUnique({
      where: {
        id: Number(payload.sub),
        deleted_at: null
      },
    });
    if (!user) throw new UnauthorizedException();

    return user;
  }

}