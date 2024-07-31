import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { User } from './user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly dbService: DbService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.dbService.getAnyUserFromDataBase(payload.user_id);
    if (!user) {
      throw new UnauthorizedException();
    }
    
    const validatedUser: User = {
      user_id: user.user_id,
      intra_user_id: user.intra_user_id,
      user_name: user.user_name,
      email: user.email,
      state: user.state,
      image_url: user.image_url,
      nick_name: user.nick_name,
      token: user.token,
      two_factor_secret: user.two_factor_secret,
      is_two_factor_enabled: user.is_two_factor_enabled,
      password: user.password,
    };

    return validatedUser;
  }
}