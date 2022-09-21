import { Injectable } from '@nestjs/common';
import { CognitoService } from './cognito/cognito.service';
import { CognitoUser } from './models/cognito-user.model';

@Injectable()
export class AuthService {
    
    constructor(private readonly cognitoService: CognitoService) {}

    public async login(phoneNumber: string): Promise<LoginResponse> {
        const cognitoUser: CognitoUser = await this.cognitoService.signIn(phoneNumber);
        return { session: cognitoUser.session };
    }
}
