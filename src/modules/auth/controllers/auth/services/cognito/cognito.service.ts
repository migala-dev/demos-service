import { Injectable } from '@nestjs/common';
import { CognitoUser } from '../../models/cognito-user.model';
import {
  CognitoUserPool,
  ICognitoUserPoolData,
  AuthenticationDetails,
  IAuthenticationDetailsData,
  CognitoUser as AWSCognitoUser,
  ICognitoUserData,
  IAuthenticationCallback,
  CognitoUserAttribute,
  CognitoUserSession,
  CognitoRefreshToken,
} from 'amazon-cognito-identity-js';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { UserVerified } from '../../models/user-verified.model';
import { Tokens } from '../../models/tokens.model';

@Injectable()
export class CognitoService {
  private userPool: CognitoUserPool;

  constructor(private config: ConfigService) {
    this.intializeUserPool();
  }

  public async signIn(phoneNumber: string): Promise<CognitoUser> {
    const authenticationDetails = this.getAuthenticationDetails(phoneNumber);
    const cognitoUser = this.getAWSCognitoUser(phoneNumber);
    cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH');

    return new Promise((res, rej) => {
      const authenticationCallback: IAuthenticationCallback = {
        customChallenge: async ({ USERNAME: cognitoId }) => {
          const session = (cognitoUser as any).Session;
          res(new CognitoUser(session, cognitoId));
        },
        onFailure: (err) => {
          if (this.userNotExist(err)) {
            res(CognitoUser.notCreated());
          } else {
            rej(err);
          }
        },
        onSuccess: (): void => {
          throw new Error('On Cognito success function not implemented.');
        },
      };
      cognitoUser.initiateAuth(authenticationDetails, authenticationCallback);
    });
  }

  public signUp(phoneNumber: string): Promise<string> {
    const password = uuidv4();
    const attributeList = [];
    const dataPhoneNumber = {
      Name: 'phone_number',
      Value: phoneNumber,
    };
    const attributePhoneNumber = new CognitoUserAttribute(dataPhoneNumber);
    attributeList.push(attributePhoneNumber);

    return new Promise((res, rej) => {
      this.userPool.signUp(
        phoneNumber,
        password,
        attributeList,
        null,
        (err, result) => {
          const cognitoId = result.userSub;
          if (err) {
            rej(err);
          }
          res(cognitoId);
        },
      );
    });
  }

  public verifyCode(
    phoneNumber: string,
    verificationCode: string,
    session: string,
  ): Promise<UserVerified> {
    const cognitoUser = this.getAWSCognitoUser(phoneNumber);
    cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH');
    (cognitoUser as any).Session = session;
    return new Promise((res, rej) => {
      cognitoUser.sendCustomChallengeAnswer(verificationCode, {
        customChallenge() {
          const currentSession = (cognitoUser as any).Session;
          const userVerified = UserVerified.withSession(currentSession);
          res(userVerified);
        },
        onSuccess: (result) => {
          const tokens = this.getTokenFromSession(result);
          const bucketName: string = this.config.get('AWS_S3_BUCKET');

          res(new UserVerified(tokens, bucketName));
        },
        onFailure: (err) => {
          rej(err);
        },
      });
    });
  }

  public refreshTokens(refreshToken: string): Promise<Tokens> {
    const cognitoUser = this.getAWSCognitoUser('');
    const cognitoRefreshToken = this.getCognitoRefreshToken(refreshToken);
    return new Promise((res, rej) => {
      cognitoUser.refreshSession(cognitoRefreshToken, (err, session) => {
        const tokens = session ? this.getTokenFromSession(session) : null;
        if (err) {
          rej(err);
        }
        res(tokens);
      });
    });
  }

  private intializeUserPool(): void {
    const poolData: ICognitoUserPoolData = {
      UserPoolId: this.config.get('AWS_USER_POOL_ID'),
      ClientId: this.config.get('AWS_CLIENT_ID'),
    };
    this.userPool = new CognitoUserPool(poolData);
  }

  private userNotExist({ message }: { message: string }) {
    return message.includes('User does not exist');
  }

  private getAuthenticationDetails(phoneNumber: string): AuthenticationDetails {
    const authenticationData: IAuthenticationDetailsData = {
      Username: phoneNumber,
    };
    return new AuthenticationDetails(authenticationData);
  }

  private getAWSCognitoUser(phoneNumber: string): AWSCognitoUser {
    const userData: ICognitoUserData = {
      Username: phoneNumber,
      Pool: this.userPool,
    };
    return new AWSCognitoUser(userData);
  }

  private getCognitoRefreshToken(refreshToken: string): CognitoRefreshToken {
    return new CognitoRefreshToken({ RefreshToken: refreshToken });
  };

  private getTokenFromSession(session: CognitoUserSession): Tokens {
    const accessToken = session.getAccessToken().getJwtToken();
    const refreshToken = session.getRefreshToken().getToken();

    return { accessToken, refreshToken };
  };
}
