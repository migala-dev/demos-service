import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy, ExtractJwt } from 'passport-jwt';
import jwkToPem, { JWK } from 'jwk-to-pem';

import { User } from '../../../core/database/entities/user.entity';
import { UsersService } from '../../../core/database/services/user.service';
import jwks from '../../../../jwks.json';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      secretOrKey: jwkToPem(jwks.keys[1] as JWK),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  async validate(payload: { username: string }): Promise<User> {
    const user: User = await this.usersService.findOneByCognitoId(
      payload.username,
    );

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
