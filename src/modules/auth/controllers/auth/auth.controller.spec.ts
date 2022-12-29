import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth/auth.service';
import { UserDeviceDto } from './dtos/user-device.dto';
import { createSpyObj } from 'jest-createspyobj';
import { UserDevice } from '../../../../core/database/entities/user-device.entity';
import { User } from '../../../../core/database/entities/user.entity';
import { LoginResponse } from './response/login.response';
import { loginConstants } from '../../../../../test/mocks/constants/constants';
import { LoginDto } from './dtos/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authSpyService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    authSpyService = createSpyObj(AuthService);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authSpyService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authSpyService.registerUserDevice.mockReturnValue(
      (async () => ({} as UserDevice))(),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the session with a correct phone number', async () => {
    authSpyService.login.mockReturnValue((async () => ({ session: loginConstants.sessionMockToken } ) as LoginResponse)());
    const phoneNumber = loginConstants.phoneNumber;
    const loginDto: LoginDto = {
      phoneNumber
    };
  
    const response = await controller.login(loginDto);

    expect(response.session).toBe(loginConstants.sessionMockToken);
  });

  describe('User Device Call', () => {
    let userDeviceMock: UserDeviceDto;
    let userMock: User;

    beforeEach(() => {
      userDeviceMock = new UserDeviceDto();
      userDeviceMock.deviceId = 'aUserDeviceId';

      userMock = new User();
      userMock.userId = 'aUserId';
    });

    it('should be defined', () => {
      expect(controller.registerUserDevice).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof controller.registerUserDevice).toBe('function');
    });

    it('should be called with a UserDeviceDto and a User instance', () => {
      jest.spyOn(controller, 'registerUserDevice');

      controller.registerUserDevice(userDeviceMock, userMock);

      expect(controller.registerUserDevice).toHaveBeenCalledWith(
        userDeviceMock,
        userMock,
      );
    });

    it('should call registerUserDevice method from AuthService with the deviceId and userId obtained from its arguments', async () => {
      await controller.registerUserDevice(userDeviceMock, userMock);

      expect(authSpyService.registerUserDevice).toHaveBeenCalledTimes(1);
      expect(authSpyService.registerUserDevice).toHaveBeenCalledWith(
        userMock.userId,
        userDeviceMock.deviceId,
      );
    });

    it('', async () => {

    });

    it('should return a UserDevice instance', async () => {
      authSpyService.registerUserDevice.mockReturnValue(
        (async () => {
          const newUserDevice: UserDevice = new UserDevice();

          return newUserDevice;
        })(),
      );

      const result: UserDevice = await controller.registerUserDevice(
        userDeviceMock,
        userMock,
      );

      expect(result instanceof UserDevice).toBeTruthy();
    });

    it('should return a UserDevice instance with the same userId and deviceId properties', async () => {
      const userId: string = 'aUserId';
      const expectedResult: UserDevice = new UserDevice();
      expectedResult.deviceId = userDeviceMock.deviceId;
      expectedResult.userId = userId;
      authSpyService.registerUserDevice.mockReturnValue(
        (async () => {
          const newUserDevice: UserDevice = new UserDevice();
          newUserDevice.deviceId = userDeviceMock.deviceId;
          newUserDevice.userId = userId;

          return newUserDevice;
        })(),
      );

      const result: UserDevice = await controller.registerUserDevice(
        userDeviceMock,
        userMock,
      );

      expect(result).toEqual(expect.objectContaining(expectedResult));
    });
  });
});
