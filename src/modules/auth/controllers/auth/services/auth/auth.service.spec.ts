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

describe('AuthService', () => {
  let service: AuthService;
  let cognitoSpyService: jest.Mocked<CognitoService>;
  let userSpyService: jest.Mocked<UserRepository>;
  let userDevicesSpyService: jest.Mocked<UserDevicesRepository>;

  beforeEach(async () => {
    cognitoSpyService = createSpyObj(CognitoService);
    userSpyService = createSpyObj(UserRepository);
    userDevicesSpyService = createSpyObj(UserDevicesRepository);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: CognitoService,
          useValue: cognitoSpyService,
        },
        {
          provide: UserRepository,
          useValue: userSpyService,
        },
        {
          provide: UserDevicesRepository,
          useValue: userDevicesSpyService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    userSpyService.findOneByCognitoId.mockReturnValue(
      (async () => ({} as User))(),
    );
    userDevicesSpyService.createOrUpdate.mockReturnValue(
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
    userSpyService.findOneByCognitoId.mockReturnValue((async () => null)());
    userSpyService.findOneByPhoneNumber.mockReturnValue((async () => null)());
    userSpyService.create.mockReturnValue((async () => ({} as any))());

    await service.login(phoneNumber);

    expect(userSpyService.findOneByCognitoId).toHaveBeenCalled();
    expect(userSpyService.findOneByPhoneNumber).toHaveBeenCalled();
    expect(userSpyService.findOneByPhoneNumber.mock.calls[0][0]).toBe(
      phoneNumber,
    );
    expect(userSpyService.create).toHaveBeenCalled();
    expect(userSpyService.create.mock.calls[0][0]).toBe(phoneNumber);
    expect(userSpyService.create.mock.calls[0][1]).toBe(
      loginConstants.cognitoMockId,
    );
    expect(userSpyService.updateCognitoId.mock.calls.length).toBe(0);
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
    userSpyService.findOneByCognitoId.mockReturnValue((async () => null)());
    userSpyService.findOneByPhoneNumber.mockReturnValue(
      (async () => ({ userId } as any))(),
    );
    userSpyService.updateCognitoId.mockReturnValue((async () => ({} as any))());

    await service.login(phoneNumber);

    expect(userSpyService.create.mock.calls.length).toBe(0);
    expect(userSpyService.updateCognitoId).toHaveBeenCalled();
    expect(userSpyService.updateCognitoId.mock.calls[0][0]).toBe(userId);
    expect(userSpyService.updateCognitoId.mock.calls[0][1]).toBe(
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

      expect(userDevicesSpyService.createOrUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return a UserDevice instance', async () => {
      userDevicesSpyService.createOrUpdate.mockReturnValue(
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

    it('should verify code', async () => {
      const expectedUserVerified = new UserVerified();
      cognitoSpyService.verifyCode.mockReturnValue(
        (async () => {
          return expectedUserVerified;
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

      expect(expectedUserVerified).toBe(result);
      expect(cognitoSpyService.verifyCode.mock.calls[0][0]).toBe(phoneNumber);
      expect(cognitoSpyService.verifyCode.mock.calls[0][1]).toBe(code);
      expect(cognitoSpyService.verifyCode.mock.calls[0][2]).toBe(session);
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
      userDevicesSpyService.createOrUpdate.mockReturnValue(
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
