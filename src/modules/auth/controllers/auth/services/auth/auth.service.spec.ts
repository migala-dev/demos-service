import { Test, TestingModule } from '@nestjs/testing';
import { loginConstants } from '../../../../../../../test/mocks/constants/constants';
import { AuthService } from './auth.service';
import { CognitoService } from '../cognito/cognito.service';
import { createSpyObj } from 'jest-createspyobj';
import { CognitoUser } from '../../models/cognito-user.model';
import { UserRepository } from '../../../../../../core/database/services/user.repository';
import { User } from '../../../../../../core/database/entities/user.entity';
import { UserDevicesRepository } from '../../../../../../core/database/services/user-device.repository';
import { UserDevice } from '../../../../../../core/database/entities/user-device.entity';
import { UserVerified } from '../../models/user-verified.model';
import { Tokens } from '../../models/tokens.model';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let cognitoSpyService: jest.Mocked<CognitoService>;
  let userSpyRepository: jest.Mocked<UserRepository>;
  let userDevicesSpyRepository: jest.Mocked<UserDevicesRepository>;

  beforeEach(async () => {
    cognitoSpyService = createSpyObj(CognitoService);
    userSpyRepository = createSpyObj(UserRepository);
    userDevicesSpyRepository = createSpyObj(UserDevicesRepository);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: CognitoService,
          useValue: cognitoSpyService,
        },
        {
          provide: UserRepository,
          useValue: userSpyRepository,
        },
        {
          provide: UserDevicesRepository,
          useValue: userDevicesSpyRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    userSpyRepository.findOneByCognitoId.mockReturnValue(
      (async () => ({} as User))(),
    );
    userDevicesSpyRepository.createOrUpdate.mockReturnValue(
      (async () => ({} as UserDevice))(),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return session-mock-value when the user login', async () => {
    const phoneNumber = loginConstants.phoneNumber;
    cognitoSpyService.signIn.mockReturnValue(
      (async () =>
        new CognitoUser(
          loginConstants.sessionMockToken,
          loginConstants.cognitoMockId,
        ))(),
    );

    const loginResponse = await service.login(phoneNumber);

    expect(loginResponse.session).toBe(loginConstants.sessionMockToken);
    expect(cognitoSpyService.signIn).toHaveBeenCalled();
    expect(cognitoSpyService.signIn).toHaveBeenCalledWith(phoneNumber);
  });

  it('should create a new user if the cognito id it was not found and there is no user created with that phone', async () => {
    const phoneNumber = loginConstants.phoneNumber;
    cognitoSpyService.signIn.mockReturnValue(
      (async () =>
        new CognitoUser(
          loginConstants.sessionMockToken,
          loginConstants.cognitoMockId,
        ))(),
    );
    userSpyRepository.findOneByCognitoId.mockReturnValue((async () => null)());
    userSpyRepository.findOneByPhoneNumber.mockReturnValue((async () => null)());
    userSpyRepository.create.mockReturnValue((async () => ({} as any))());

    await service.login(phoneNumber);

    expect(userSpyRepository.findOneByCognitoId).toHaveBeenCalled();
    expect(userSpyRepository.findOneByPhoneNumber).toHaveBeenCalled();
    expect(userSpyRepository.findOneByPhoneNumber.mock.calls[0][0]).toBe(
      phoneNumber,
    );
    expect(userSpyRepository.create).toHaveBeenCalled();
    expect(userSpyRepository.create.mock.calls[0][0]).toBe(phoneNumber);
    expect(userSpyRepository.create.mock.calls[0][1]).toBe(
      loginConstants.cognitoMockId,
    );
    expect(userSpyRepository.updateCognitoId.mock.calls.length).toBe(0);
  });

  it('should update the cognitoId if the cognito id it was not found and there is a user created with that phone', async () => {
    const phoneNumber = loginConstants.phoneNumber;
    cognitoSpyService.signIn.mockReturnValue(
      (async () =>
        new CognitoUser(
          loginConstants.sessionMockToken,
          loginConstants.cognitoMockId,
        ))(),
    );
    const userId = 'user-id-mock';
    userSpyRepository.findOneByCognitoId.mockReturnValue((async () => null)());
    userSpyRepository.findOneByPhoneNumber.mockReturnValue(
      (async () => ({ userId } as any))(),
    );
    userSpyRepository.updateCognitoId.mockReturnValue((async () => ({} as any))());

    await service.login(phoneNumber);

    expect(userSpyRepository.create.mock.calls.length).toBe(0);
    expect(userSpyRepository.updateCognitoId).toHaveBeenCalled();
    expect(userSpyRepository.updateCognitoId.mock.calls[0][0]).toBe(userId);
    expect(userSpyRepository.updateCognitoId.mock.calls[0][1]).toBe(
      loginConstants.cognitoMockId,
    );
  });

  it('should signUp the phoneNumber if the user does not exist on aws', async () => {
    const phoneNumber = loginConstants.phoneNumber;
    cognitoSpyService.signIn
      .mockReturnValueOnce((async () => CognitoUser.notCreated())())
      .mockReturnValue(
        (async () =>
          new CognitoUser(
            loginConstants.sessionMockToken,
            loginConstants.cognitoMockId,
          ))(),
      );

    const loginResponse = await service.login(phoneNumber);

    expect(cognitoSpyService.signIn.mock.calls.length).toBe(2);
    expect(cognitoSpyService.signUp).toHaveBeenCalled();
    expect(cognitoSpyService.signUp.mock.calls[0][0]).toBe(phoneNumber);
    expect(loginResponse.session).toBe(loginConstants.sessionMockToken);
  });

  describe('registerUserDevice method', () => {
    let userId: string;
    let deviceId: string;

    beforeEach(() => {
      userId = '';
      deviceId = '';
    });

    it('should be defined', () => {
      expect(service.registerUserDevice).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof service.registerUserDevice).toBe('function');
    });

    it('should be called with a userId and a deviceId of type string', async () => {
      jest.spyOn(service, 'registerUserDevice');

      await service.registerUserDevice(userId, deviceId);

      expect(service.registerUserDevice).toHaveBeenCalledWith(userId, deviceId);
    });

    it('should createOrUpdate method from UserDevicesService be called', async () => {
      await service.registerUserDevice(userId, deviceId);

      expect(userDevicesSpyRepository.createOrUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return a UserDevice instance', async () => {
      userDevicesSpyRepository.createOrUpdate.mockReturnValue(
        (async () => {
          const userDevice: UserDevice = new UserDevice();

          return userDevice;
        })(),
      );

      const result: UserDevice = await service.registerUserDevice(
        userId,
        deviceId,
      );

      expect(result instanceof UserDevice).toBeTruthy();
    });

    it('should verify code and return user', async () => {
      const expectedTokens = new Tokens()
      const expectedBucketName = 'demos-bucket';
      cognitoSpyService.verifyCode.mockReturnValue(
        (async () => {
          return new UserVerified(expectedTokens, expectedBucketName);
        })(),
      );
      const expectedUser = new User();
      userSpyRepository.findOneByPhoneNumber.mockReturnValue(
        (async () => {
          return expectedUser;
        })(),
      );

      const phoneNumber = loginConstants.phoneNumber;
      const code = '010202';
      const session = loginConstants.sessionMockToken;

      const result: UserVerified = await service.verifyCode(
        phoneNumber,
        code,
        session,
      );

      expect(cognitoSpyService.verifyCode).toHaveBeenCalledTimes(1);
      expect(cognitoSpyService.verifyCode).toHaveBeenCalledWith(
        phoneNumber,
        code,
        session
      );
      
      expect(userSpyRepository.findOneByPhoneNumber).toHaveBeenCalledTimes(1);
      expect(userSpyRepository.findOneByPhoneNumber).toHaveBeenCalledWith(phoneNumber);

      expect(result.bucketName).toBe(expectedBucketName);
      expect(result.tokens).toBe(expectedTokens);
      expect(result.user).toBe(expectedUser);
    });

    it('should not look for user if the code session do not return the tokens', async () => {
      cognitoSpyService.verifyCode.mockReturnValue(
        (async () => {
          return UserVerified.withSession('session-mock');
        })(),
      );

      const phoneNumber = loginConstants.phoneNumber;
      const code = '010202';
      const session = loginConstants.sessionMockToken;

      const result: UserVerified = await service.verifyCode(
        phoneNumber,
        code,
        session,
      );

      expect(cognitoSpyService.verifyCode).toHaveBeenCalledTimes(1);
      expect(cognitoSpyService.verifyCode).toHaveBeenCalledWith(
        phoneNumber,
        code,
        session
      );
      
      expect(userSpyRepository.findOneByPhoneNumber).toHaveBeenCalledTimes(0);

      expect(result.session).toBe('session-mock');
    });

  it('should handle unauthorized error if the session is not correct', async () => {
    cognitoSpyService.verifyCode.mockReturnValue(
      (async () => {
        throw { message: 'Not valid session' };
      })(),
    );

    const phoneNumber = loginConstants.phoneNumber;
    const code = '010202';
    const session = loginConstants.sessionMockToken;
    
    const execute = () => service.verifyCode(
      phoneNumber,
      code,
      session,
    );

    await expect(execute).rejects.toThrow(new HttpException('Not valid session', HttpStatus.UNAUTHORIZED));
  });

    it('should refresh token', async () => {
      const expectedTokens = new Tokens();
      const refreshToken = 'refresh-token-mock';
      cognitoSpyService.refreshTokens.mockReturnValue(
        (async () => {
          return expectedTokens;
        })(),
      );

      const result: Tokens = await service.refreshTokens(refreshToken);

      expect(expectedTokens).toBe(result);
      expect(cognitoSpyService.refreshTokens.mock.calls[0][0]).toBe(
        refreshToken,
      );
    });

    it('should return an instance of UserDevice with the same properties passed to the method', async () => {
      const expectedResult: UserDevice = new UserDevice();
      expectedResult.userId = userId;
      expectedResult.deviceId = deviceId;
      userDevicesSpyRepository.createOrUpdate.mockReturnValue(
        (async () => {
          const userDevice = new UserDevice();
          userDevice.userId = userId;
          userDevice.deviceId = deviceId;

          return userDevice;
        })(),
      );

      const result: UserDevice = await service.registerUserDevice(
        userId,
        deviceId,
      );

      expect(result).toEqual(expect.objectContaining(expectedResult));
    });
  });
});
