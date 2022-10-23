import { Test, TestingModule } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';

import { UserController } from './user.controller';
import { User } from '../../../../core/database/entities/user.entity';
import { UserService } from './services/user/user.service';

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

    userSpyService.uploadAvatarImage.mockReturnValue((async () => ({}) as User)());
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateProfilePicture method', () => {
    let userMock: User;
    let fileMock: Express.Multer.File;

    beforeEach(() => {
      userMock = new User();
      fileMock = {
        fieldname: '',
        originalname: '',
        encoding: '',
        mimetype: '',
        size: 0,
        stream: null,
        destination: '',
        filename: '',
        path: '',
        buffer: null
      };
    });

    it('should be defined', () => {
      expect(controller.updateProfilePicture).toBeDefined();
    });

    it('should be called with a User Instance and a File intance', () => {
      jest.spyOn(controller, 'updateProfilePicture');
      
      controller.updateProfilePicture(userMock, fileMock);

      expect(controller.updateProfilePicture).toHaveBeenCalledWith(userMock, fileMock);
    });

    it('should return a User instance', () => {
      userSpyService.uploadAvatarImage.mockReturnValue((async () => new User())());

      const result: Promise<User> = controller.updateProfilePicture(userMock, fileMock);

      expect(result instanceof Promise<User>).toBeTruthy();
    });

    it('should called uploadAvatarImage method from userService', () => {
      controller.updateProfilePicture(userMock, fileMock);

      expect(userSpyService.uploadAvatarImage).toHaveBeenCalledTimes(1);
    });

    it('should called uploadAvatarImage method from userService with a user and a file instance', () => {
      controller.updateProfilePicture(userMock, fileMock);

      expect(userSpyService.uploadAvatarImage).toHaveBeenCalledTimes(1);
      expect(userSpyService.uploadAvatarImage).toHaveBeenCalledWith(userMock, fileMock);
    });

    it('should return the same user instance returned from uploadAvatarImage method', async () => {
      userMock.userId = '';
      userMock.name = '';
      userMock.phoneNumber = '';
      userMock.profilePictureKey = '';
      userMock.cognitoId = '';
      userMock.createdAt = null;
      userMock.updatedAt = null;
      userSpyService.uploadAvatarImage.mockReturnValue((async () => userMock)());

      const result: User = await controller.updateProfilePicture(userMock, fileMock);

      expect(result).toStrictEqual(
        expect.objectContaining(userMock)
      );
    });

    it('should return a User instance with an expected profilePictureKey', async () => {
      userMock.userId = '';
      userMock.name = '';
      userMock.phoneNumber = '';
      userMock.profilePictureKey = '';
      userMock.cognitoId = '';
      userMock.createdAt = null;
      userMock.updatedAt = null;
      const expectedProfilePictureKey: string = 'testProfilePictureKey';
      userSpyService.uploadAvatarImage.mockReturnValue((async () => {
        userMock.profilePictureKey = expectedProfilePictureKey;

        return userMock;
      })());

      const result: User = await controller.updateProfilePicture(userMock, fileMock);

      expect(result).toStrictEqual(
        expect.objectContaining({ profilePictureKey: expectedProfilePictureKey })
      );
    });
  });
});
