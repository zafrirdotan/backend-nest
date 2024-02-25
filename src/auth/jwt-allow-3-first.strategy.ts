import { Injectable } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request as RequestType } from 'express';
import { TempUser } from './entitys/temp-user.entity';

@Injectable()
export class JwtAllow3FirstStrategy extends PassportStrategy(
  Strategy,
  'jwt-allow-3-first',
) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtAllow3FirstStrategy.extractJWT,
        JwtAllow3FirstStrategy.extractTempUserJWT,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: any) {
    if (payload.type === 'temp_user' && payload.messageCount < 3) {
      const temp_user: TempUser = {
        messageCount: payload.messageCount,
        firstCreatedAt: payload.firstCreatedAt,
        type: payload.type,
      };
      return temp_user;
    } else {
      const user = await this.authService.validateUser(payload.email);
      return user;
    }
  }

  private static extractJWT(req: RequestType): string | null {
    if (req?.cookies?.token?.access_token?.length > 0) {
      return req.cookies.token.access_token;
    }
    return null;
  }

  private static extractTempUserJWT(req: RequestType): string | null {
    if (req?.cookies?.token?.temp_user_access_token?.length > 0) {
      return req.cookies.token.temp_user_access_token;
    }
    return null;
  }
}
