import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { LoginDto } from './dtos/login.dto';
import { LoginResponse } from './response/login.response';
import { UserDeviceDto } from './dtos/user-device.dto';
import { UserDevice } from '../../../../core/database/entities/user-device.entity';
import { UserFromRequest } from '../../../../core/decorators/auth/user-from-request/user-from-request.decorator';
import { User } from '../../../../core/database/entities/user.entity';
import { Public } from '../../../../core/decorators/auth/public/public.decorator';
import { VerifyCodeDto } from './dtos/verify-code.dto';
import { UserVerified } from './models/user-verified.model';
import { RefreshTokensDto } from './dtos/refresh-tokens.dto';
import { Tokens } from './models/tokens.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public login(@Body() { phoneNumber }: LoginDto): Promise<LoginResponse> {
    return this.authService.login(phoneNumber);
  }

  @Public()
  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  public verifyCode(@Body() { phoneNumber, code, session }: VerifyCodeDto): Promise<UserVerified> {
    return this.authService.verifyCode(phoneNumber, code, session);
  }

  @Public()
  @Post('refresh-tokens')
  @HttpCode(HttpStatus.OK)
  public refreshTokens(@Body() { refreshToken }: RefreshTokensDto): Promise<Tokens> {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('user-device')
  @HttpCode(HttpStatus.OK)
  public registerUserDevice(
    @Body() { deviceId }: UserDeviceDto,
    @UserFromRequest() { userId }: User,
  ): Promise<UserDevice> {
    return this.authService.registerUserDevice(userId, deviceId);
  }
}
