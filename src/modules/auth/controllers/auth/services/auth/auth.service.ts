import { Injectable } from '@nestjs/common';
import { CognitoService } from '../cognito/cognito.service';
import { CognitoUser } from '../../models/cognito-user.model';
import { UsersService } from '../../../../../../core/database/services/user.service';
import { User } from '../../../../../../core/database/entities/user.entity';

@Injectable()
export class AuthService {
    
    constructor(private readonly cognitoService: CognitoService, private readonly usersService: UsersService) {}

    public async login(phoneNumber: string): Promise<LoginResponse> {
        const cognitoUser: CognitoUser = await this.cognitoService.signIn(phoneNumber);

        if(!cognitoUser.isUserCreated) {
            await this.cognitoService.signUp(phoneNumber);
            return this.login(phoneNumber);
        }

        await this.checkUserRecord(phoneNumber, cognitoUser.cognitoId);

        return { session: cognitoUser.session };
    }

    private async checkUserRecord(phoneNumber: string, cognitoId: string): Promise<void> {
        let user: User = await this.usersService.findOneByCognitoId(cognitoId);
        if(!user) {
            user = await this.usersService.findOneByPhoneNumber(phoneNumber);
            if(!user) {
                return this.usersService.create(phoneNumber, cognitoId).then(() => null);
            }
            return this.usersService.updateCognitoId(user.userId, cognitoId).then(() => null);
        }
    }
}
