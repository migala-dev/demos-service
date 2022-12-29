import { Test, TestingModule } from '@nestjs/testing';
import { CognitoService } from './cognito.service';
import { ConfigService } from '@nestjs/config';
import { loginConstants } from '../../../../../../../test/mocks/constants/constants';
import { UserVerified } from '../../models/user-verified.model';

const bucketName = 'demos-mock-bucket-name';

describe('CognitoService', () => {
  let service: CognitoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CognitoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AWS_S3_BUCKET') {
                return bucketName;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CognitoService>(CognitoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a cognito user not created', async () => {
    const phoneNumber = loginConstants.phoneNumberNotCreated;

    const cognitoUser = await service.signIn(phoneNumber);

    expect(cognitoUser.isUserCreated).toBe(false);
  });

  it('should return a cognito user created with the session', async () => {
    const phoneNumber = loginConstants.phoneNumber;

    const cognitoUser = await service.signIn(phoneNumber);

    expect(cognitoUser.isUserCreated).toBe(true);
    expect(cognitoUser.cognitoId).toBe(loginConstants.cognitoMockId);
    expect(cognitoUser.session).toBe(loginConstants.sessionMockToken);
  });

  it('should return create a cognito user and return the cognito id', async () => {
    const phoneNumber = loginConstants.phoneNumberNotCreated;

    const cognitoId = await service.signUp(phoneNumber);

    expect(cognitoId).toBe(loginConstants.cognitoMockId);
  });

  it('should return only the session if the verification code is incorrect', async () => {
    const phoneNumber = loginConstants.phoneNumber;
    const verificationCode = '1234';
    const sessionMockToken = loginConstants.sessionMockToken;

    const result: UserVerified = await service.verifyCode(
      phoneNumber,
      verificationCode,
      sessionMockToken,
    );

    expect(result.session).toBe(loginConstants.secondSessionMockToken);
    expect(result.tokens).toBe(undefined);
    expect(result.bucketName).toBe(undefined);
  });

  it('should return the tokens and bucket Nname if the verification code is correct', async () => {
    const phoneNumber = loginConstants.phoneNumber;
    const verificationCode = loginConstants.correctVerificationCode;
    const sessionMockToken = loginConstants.sessionMockToken;

    const result: UserVerified = await service.verifyCode(
      phoneNumber,
      verificationCode,
      sessionMockToken,
    );

    expect(result.session).toBe(undefined);
    expect(result.tokens.accessToken).toBe(loginConstants.accessTokenMock);
    expect(result.tokens.refreshToken).toBe(loginConstants.refreshTokenMock);
    expect(result.bucketName).toBe(bucketName);
  });

  it('should throw an error if it is not the correct session', async () => {
    const phoneNumber = loginConstants.phoneNumber;
    const verificationCode = loginConstants.correctVerificationCode;
    const sessionMockToken = loginConstants.sessionMockToken + 'incorrect';
    try {
      await service.verifyCode(phoneNumber, verificationCode, sessionMockToken);
    } catch (err) {
      expect(err.message).toBe('Not a valid session');
    }
  });
});
