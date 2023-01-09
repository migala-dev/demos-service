import { Test, TestingModule } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';

import { UserController } from './user.controller';
import { User } from '../../../../core/database/entities/user.entity';
import { UserService } from './services/user/user.service';
import { loginConstants } from '../../../../../test/mocks/constants/constants';
import { RecoverData } from './models/recover-data.model';

describe('UserController', () => {
  let controller: UserController;
  let userSpyService: jest.Mocked<UserService>;

  beforeEach(async () => {
    userSpyService = createSpyObj(UserService);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userSpyService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);

    userSpyService.uploadAvatarImage.mockReturnValue(
      (async () => ({} as User))(),
    );
  });

  describe('updateProfilePicture method', () => {
    let userMock: User;
    let fileMock: Express.Multer.File;

    beforeEach(() => {
      userMock = new User();
      userMock.userId = 'aUserId';
      userMock.name = 'aName';
      userMock.phoneNumber = 'aPhoneNumber';
      userMock.profilePictureKey = 'aProfilePictureKey';
      userMock.cognitoId = 'aCognitoId';
      userMock.createdAt = null;
      userMock.updatedAt = null;
      fileMock = {
        fieldname: 'aFieldname',
        originalname: 'anOriginalname',
        encoding: 'anEncoding',
        mimetype: 'aMimeType',
        size: 0,
        stream: null,
        destination: 'aDestination',
        filename: 'aFilename',
        path: 'aPath',
        buffer: null,
      };
    });

    it('should upload avatar image', () => {
      controller.updateProfilePicture(userMock, fileMock);

      expect(userSpyService.uploadAvatarImage).toHaveBeenCalledTimes(1);
      expect(userSpyService.uploadAvatarImage).toHaveBeenCalledWith(
        userMock,
        fileMock,
      );
    });

    it('should return the user with the new profile picture key', async () => {
      userMock.profilePictureKey = 'testProfilePictureKey';
      const expectedProfilePictureKey: string = userMock.profilePictureKey;
      const expectedUser = new User();
      expectedUser.userId = userMock.userId;
      expectedUser.name = userMock.name;
      expectedUser.phoneNumber = userMock.phoneNumber;
      expectedUser.profilePictureKey = expectedProfilePictureKey;
      expectedUser.cognitoId = userMock.cognitoId;
      expectedUser.createdAt = userMock.createdAt;
      expectedUser.updatedAt = userMock.updatedAt;
      userSpyService.uploadAvatarImage.mockReturnValue(
        (async () => userMock)(),
      );

      const result: User = await controller.updateProfilePicture(
        userMock,
        fileMock,
      );

      expect(result).toStrictEqual(expect.objectContaining(expectedUser));
    });


    it('should return the user with the new profile picture key', async () => {
      const userId = loginConstants.userId;
      const user = { userId } as User;
      const revoveredDataExpected = new RecoverData();

      userSpyService.recoverUserData.mockReturnValue(
        (async () => revoveredDataExpected)()
      );

      const result = await controller.recoverUserData(user);

      expect(result).toBe(revoveredDataExpected);
      expect(userSpyService.recoverUserData).toHaveBeenCalledWith(userId);
    });
  });
});
