import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth/auth.service';
import { CognitoService } from './services/cognito/cognito.service';
import { ConfigService } from '@nestjs/config';
import { UserDeviceDto } from './dtos/user-device.dto';
import { createSpyObj } from 'jest-createspyobj';
import { UserDevice } from '../../../../core/database/entities/user-device.entity';

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
        }
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authSpyService.registerUserDevice.mockReturnValue((async () => ({}) as UserDevice)());
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Login Call', () => {
    it('should return the session with a correct phone number', () => {
      
    });
  });

  describe('User Device Call', () => {
    let userDevice: UserDeviceDto;

    beforeEach(() => {
      userDevice = { deviceId: '' };
    });

    it('should be defined', () => {
      expect(controller.registerUserDevice).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof controller.registerUserDevice).toBe('function');
    })

    it('should be called with UserDeviceDto with a property named deviceId of type string', () => {
      const registerUserDeviceSpyMethod = jest.spyOn(controller, 'registerUserDevice');
      const expectedUserDevice: UserDeviceDto = { deviceId: userDevice.deviceId };

      controller.registerUserDevice(userDevice)

      expect(registerUserDeviceSpyMethod).toHaveBeenCalledWith(expectedUserDevice);
    });

    it('should be called AuthService registerUserDevice method', async () => {
      await controller.registerUserDevice(userDevice);

      expect(authSpyService.registerUserDevice).toHaveBeenCalled();
    });

    it('should return a UserDevice instance', async () => {
      authSpyService.registerUserDevice.mockReturnValue((async () => {
        const newUserDevice: UserDevice = new UserDevice();

        return newUserDevice;
      })());

      const result: UserDevice = await controller.registerUserDevice(userDevice);

      expect(result instanceof UserDevice).toBeTruthy();
    });

    it('should return a UserDevice instance with the same userId and deviceId properties', async () => {
      const userId: string = '12345';
      const expectedResult: UserDevice = new UserDevice();
      expectedResult.deviceId = userDevice.deviceId;
      expectedResult.userId = userId;
      authSpyService.registerUserDevice.mockReturnValue((async () => {
        const newUserDevice: UserDevice = new UserDevice();
        newUserDevice.deviceId = userDevice.deviceId;
        newUserDevice.userId = userId;

        return newUserDevice;
      })());

      const result: UserDevice = await controller.registerUserDevice(userDevice);

      expect(result).toEqual(
        expect.objectContaining(expectedResult)
      )
    });
  });
});
