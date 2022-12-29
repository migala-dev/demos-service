import { Injectable } from '@nestjs/common';
import { CognitoService } from '../cognito/cognito.service';
import { CognitoUser } from '../../models/cognito-user.model';
import { UsersService } from '../../../../../../core/database/services/user.service';
import { User } from '../../../../../../core/database/entities/user.entity';
import { LoginResponse } from '../../response/login.response';
import { UserDevice } from '../../../../../../core/database/entities/user-device.entity';
import { UserDevicesService } from '../../../../../../core/database/services/user-device.service';
import { UserVerified } from '../../models/user-verified.model';

@Injectable()
export class AuthService {
    
    constructor(
      private readonly cognitoService: CognitoService, 
      private readonly usersService: UsersService,
      private readonly userDevicesService: UserDevicesService,
    ) {}

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

    public async verifyCode(phoneNumber: string, code: string, session: string): Promise<UserVerified> {
        return await this.cognitoService.verifyCode(phoneNumber, code, session);
    }

    public async registerUserDevice(userId: string, deviceId: string): Promise<UserDevice> {
      const userDevice: UserDevice = await this.userDevicesService.createOrUpdate(userId, deviceId);

      return userDevice;
    }
}
