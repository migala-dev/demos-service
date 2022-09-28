import { Injectable } from '@nestjs/common';
import { CognitoService } from '../cognito/cognito.service';
import { CognitoUser } from '../../models/cognito-user.model';
import { UsersService } from 'src/core/database/services/user.service';

@Injectable()
export class AuthService {
    
    constructor(private readonly cognitoService: CognitoService, private readonly usersService: UsersService) {}

    public async login(phoneNumber: string): Promise<LoginResponse> {
        const cognitoUser: CognitoUser = await this.cognitoService.signIn(phoneNumber);

        if(!cognitoUser.isUserCreated) {
            await this.cognitoService.signUp(phoneNumber);
            return this.login(phoneNumber);
        }

        await this.checkUserRecord(cognitoUser.cognitoId);

        return { session: cognitoUser.session };
    }

    private async checkUserRecord(cognitId: string): Promise<void> {
        
    }
}
