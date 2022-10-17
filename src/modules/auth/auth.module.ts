import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './controllers/auth/services/auth/auth.service';
import { CognitoService } from './controllers/auth/services/cognito/cognito.service';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import jwkToPem, { JWK } from 'jwk-to-pem';
import jwks from '../../../jwks.json';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwkToPem(jwks.keys[1] as JWK),
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    CognitoService,
    AuthService,
    JwtStrategy,
  ],
})
export class AuthModule {}
