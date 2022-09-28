import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './controllers/auth/services/auth/auth.service';
import { CognitoService } from './controllers/auth/services/cognito/cognito.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [
    CognitoService,
    AuthService,
  ]
})
export class AuthModule {}
