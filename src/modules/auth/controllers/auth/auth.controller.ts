import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { LoginDto } from './dtos/login.dto';
import { LoginResponse } from './response/login.response';
import { UserDeviceDto } from './dtos/user-device.dto';
import { UserDevice } from '../../../../core/database/entities/user-device.entity';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    public login(@Body() { phoneNumber }: LoginDto): Promise<LoginResponse> {
        return this.authService.login(phoneNumber);
    }

    @Post('user-device')
    @HttpCode(HttpStatus.OK)
    public registerUserDevice(@Body() { deviceId }: UserDeviceDto): Promise<UserDevice> {
        const userIdMock: string = '';

        return this.authService.registerUserDevice(userIdMock, deviceId);
    }
}
