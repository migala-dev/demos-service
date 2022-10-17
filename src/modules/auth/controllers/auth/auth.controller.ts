import { Body, Request, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { LoginDto } from './dtos/login.dto';
import { LoginResponse } from './response/login.response';
import { UserDeviceDto } from './dtos/user-device.dto';
import { UserDevice } from '../../../../core/database/entities/user-device.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Auth } from '../../../../decorators/auth.decorator';
import { User } from '../../../../core/database/entities/user.entity';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    public login(@Body() { phoneNumber }: LoginDto): Promise<LoginResponse> {
        return this.authService.login(phoneNumber);
    }

    @UseGuards(JwtAuthGuard)
    @Post('user-device')
    @HttpCode(HttpStatus.OK)
    public registerUserDevice(
      @Body() { deviceId }: UserDeviceDto, 
      @Auth() { userId }: User
    ): Promise<UserDevice> {
      return new Promise((resolve, reject) => {
        console.log(userId);
        console.log(deviceId);
        resolve(new UserDevice());
      });
      //return this.authService.registerUserDevice(userIdMock, deviceId);
    }
}
