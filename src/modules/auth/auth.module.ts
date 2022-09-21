import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './controllers/auth/auth.service';
import { CognitoService } from './controllers/auth/cognito/cognito.service';

@Module({
  controllers: [AuthController],
  providers: [
    CognitoService,
    AuthService,
  ]
})
export class AuthModule {}
