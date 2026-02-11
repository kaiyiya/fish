import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'defaultSecret'),
    });
  }

  async validate(payload: any) {
    // 从数据库获取完整用户信息（包括角色）
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      username: user.username,
      role: user.role || 'user',
    };
  }
}
