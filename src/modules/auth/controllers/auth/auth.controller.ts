import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { LoginDto } from './dtos/login.dto';



@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    public login(@Body() { phoneNumber }: LoginDto): Promise<LoginResponse> {
        return this.authService.login(phoneNumber);
    }
}
