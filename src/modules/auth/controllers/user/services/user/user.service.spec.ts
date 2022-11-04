import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { createSpyObj } from 'jest-createspyobj';
import { UpdateResult } from 'typeorm';

import { UserService } from './user.service';
import { User } from '../../../../../../core/database/entities/user.entity';
import { UsersService } from '../../../../../../core/database/services/user.service';
import { FileService } from '../file/file.service';
import { UploadResponse } from '../file/response/upload.response';

describe('UserService', () => {
  let service: UserService;
  let fileSpyService: jest.Mocked<FileService>;
  let usersSpyService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    fileSpyService = createSpyObj(FileService);
    usersSpyService = createSpyObj(UsersService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: FileService,
          useValue: fileSpyService,
        },
        {
          provide: UsersService,
          useValue: usersSpyService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    fileSpyService.uploadPublicFile.mockReturnValue(
      (async () => ({} as UploadResponse))(),
    );
    usersSpyService.updatePictureKey.mockReturnValue(
      (async () => ({} as UpdateResult))(),
    );
  });

  describe('uploadAvatarImage method', () => {
    let userMock: User;
    let fileMock: Express.Multer.File;

    beforeEach(() => {
      userMock = new User();
      userMock.userId = '';
      userMock.name = '';
      userMock.phoneNumber = '';
      userMock.profilePictureKey = '';
      userMock.cognitoId = '';
      userMock.createdAt = null;
      userMock.updatedAt = null;
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
        buffer: null,
      };
    });

    it('should throw a BadRequestException if no image is sended', async () => {
      const expectedErrorMessage = 'Avatar image is required';

      const execute = async () =>
        await service.uploadAvatarImage(userMock, null);

      await expect(execute).rejects.toThrowError(BadRequestException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should upload the new profile picture', async () => {
      await service.uploadAvatarImage(userMock, fileMock);

      expect(fileSpyService.uploadPublicFile).toHaveBeenCalledTimes(1);
      expect(fileSpyService.uploadPublicFile).toHaveBeenCalledWith(
        userMock.cognitoId,
        fileMock.buffer,
        fileMock.originalname,
        fileMock.fieldname,
      );
    });

    it('should return the user with the new profile picture key', async () => {
      const expectedImageKey = 'newKey';
      const expectedUser: User = new User();
      expectedUser.userId = userMock.userId;
      expectedUser.name = userMock.name;
      expectedUser.phoneNumber = userMock.phoneNumber;
      expectedUser.profilePictureKey = expectedImageKey;
      expectedUser.cognitoId = userMock.cognitoId;
      expectedUser.createdAt = userMock.createdAt;
      expectedUser.updatedAt = userMock.updatedAt;
      fileSpyService.uploadPublicFile.mockReturnValue(
        (async () => {
          return { imageKey: expectedImageKey } as UploadResponse;
        })(),
      );

      const result: User = await service.uploadAvatarImage(userMock, fileMock);

      expect(result.profilePictureKey).toBe(expectedImageKey);
      expect(result).toStrictEqual(expect.objectContaining(expectedUser));
    });

    it('should delete the old profile picture', async () => {
      const oldProfilePictureKey = 'oldTestImageKey';
      userMock.profilePictureKey = oldProfilePictureKey;
      fileSpyService.uploadPublicFile.mockReturnValue(
        (async () => {
          return { imageKey: 'newTestImageKey' } as UploadResponse;
        })(),
      );

      await service.uploadAvatarImage(userMock, fileMock);

      expect(fileSpyService.deletePublicFile).toHaveBeenCalledTimes(1);
      expect(fileSpyService.deletePublicFile).toHaveBeenCalledWith(
        oldProfilePictureKey,
      );
    });

    it('should update the user profile picture key with the uploaded file key', async () => {
      const newProfilePictureKey = 'newTestImageKey';
      userMock.userId = 'aUserId';
      fileSpyService.uploadPublicFile.mockReturnValue(
        (async () => {
          return { imageKey: newProfilePictureKey } as UploadResponse;
        })(),
      );

      await service.uploadAvatarImage(userMock, fileMock);

      expect(usersSpyService.updatePictureKey).toHaveBeenCalledTimes(1);
      expect(usersSpyService.updatePictureKey).toHaveBeenCalledWith(
        userMock.userId,
        newProfilePictureKey,
      );
    });
  });

  describe('updateUserName method', () => {
    let userMock: User;

    beforeEach(() => {
      userMock = new User();
      userMock.userId = 'aUserId';
      userMock.name = 'aName';
      userMock.phoneNumber = 'aPhoneNumber';
      userMock.profilePictureKey = 'aProfilePictureKey';
      userMock.cognitoId = 'aCognitoId';
      userMock.createdAt = null;
      userMock.updatedAt = null;
    });

    it('should return the user with new username', async () => {
      const newName = 'new aName';
  
      const expectedUser = Object.assign({}, userMock);
      expectedUser.name = newName;
      usersSpyService.updateUserName.mockReturnValue(
        (async () => expectedUser)(),
      );

      const result: User = await service.updateUserName(
        userMock,
        newName,
      );
  
      expect(result).toStrictEqual(expect.objectContaining(expectedUser));
    });

    it('should throw a EvalError if name is empty', async () => {
      const newName = '';
  
      const expectedUser = Object.assign({}, userMock);
      expectedUser.name = newName;
      usersSpyService.updateUserName.mockReturnValue(
        (async () => expectedUser)(),
      );

      const execute = async () =>
        await service.updateUserName(
          userMock,
          newName,
        );
  
      await expect(execute).rejects.toThrowError(EvalError);
    });
  });
});
