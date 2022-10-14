import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy, ExtractJwt } from 'passport-jwt';

import { User } from '../../../core/database/entities/user.entity';
import { UsersService } from '../../../core/database/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      secretOrKey: 'test',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: { cognitoId: string }): Promise<User> {
    const user: User = await this.usersService.findOneByCognitoId(payload.cognitoId);
    if (!user) throw new UnauthorizedException();

    return user;
  }
}