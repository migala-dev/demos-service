import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CognitoService } from '../cognito/cognito.service';
import { CognitoUser } from '../../models/cognito-user.model';
import { UserRepository } from '../../../../../../core/database/services/user.repository';
import { User } from '../../../../../../core/database/entities/user.entity';
import { LoginResponse } from '../../response/login.response';
import { UserDevice } from '../../../../../../core/database/entities/user-device.entity';
import { UserDevicesRepository } from '../../../../../../core/database/services/user-device.repository';
import { UserVerified } from '../../models/user-verified.model';
import { Tokens } from '../../models/tokens.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly cognitoService: CognitoService,
    private readonly userRepository: UserRepository,
    private readonly userDevicesRepository: UserDevicesRepository,
  ) {}

  public async login(phoneNumber: string): Promise<LoginResponse> {
    const cognitoUser: CognitoUser = await this.cognitoService.signIn(
      phoneNumber,
    );

    if (!cognitoUser.isUserCreated) {
      await this.cognitoService.signUp(phoneNumber);
      return this.login(phoneNumber);
    }

    await this.checkUserRecord(phoneNumber, cognitoUser.cognitoId);

    return { session: cognitoUser.session };
  }

  private async checkUserRecord(
    phoneNumber: string,
    cognitoId: string,
  ): Promise<void> {
    let user: User = await this.userRepository.findOneByCognitoId(cognitoId);
    if (!user) {
      user = await this.userRepository.findOneByPhoneNumber(phoneNumber);
      if (!user) {
        return this.userRepository
          .create(phoneNumber, cognitoId)
          .then(() => null);
      }
      return this.userRepository
        .updateCognitoId(user.userId, cognitoId)
        .then(() => null);
    }
  }

  public async verifyCode(
    phoneNumber: string,
    code: string,
    session: string,
  ): Promise<UserVerified> {
    try {
      const userVerified = await this.cognitoService.verifyCode(phoneNumber, code, session);
  
      if (userVerified.isVerifed) {
        const user = await this.userRepository.findOneByPhoneNumber(phoneNumber);
        userVerified.user = user;
      }
      return userVerified;
    } catch(err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED);
    }
  }

  public async refreshTokens(refreshToken: string): Promise<Tokens> {
    return await this.cognitoService.refreshTokens(refreshToken);
  }

  public async registerUserDevice(
    userId: string,
    deviceId: string,
  ): Promise<UserDevice> {
    const userDevice: UserDevice =
      await this.userDevicesRepository.createOrUpdate(userId, deviceId);

    return userDevice;
  }
}
