import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { createSpyObj } from 'jest-createspyobj';
import { S3 } from 'aws-sdk';
import { UpdateResult } from 'typeorm';

import { UserService } from './user.service';
import { User } from '../../../../../../core/database/entities/user.entity';
import { UsersService } from '../../../../../../core/database/services/user.service';
import { FileService } from '../file/file.service';

describe('UserService', () => {
  let service: UserService;
  let fileSpyService: jest.Mocked<FileService>;
  let usersSpyService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    fileSpyService = createSpyObj(FileService);
    usersSpyService = createSpyObj(UsersService)

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

    fileSpyService.uploadPublicFile.mockReturnValue((async () => ({}) as S3.ManagedUpload.SendData)());
    usersSpyService.updatePictureKey.mockReturnValue((async () => ({}) as UpdateResult)())
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
        buffer: null
      };
    });

    it('should be defined', () => {
      expect(service.uploadAvatarImage).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof service.uploadAvatarImage).toBe('function');
    });
  
    it('should be an async function', () => {
      const string: string = service.uploadAvatarImage.toString();

      const isAsync: boolean = string.includes('async');

      expect(isAsync).toBeTruthy();
    });

    it('should be called with a User and a File instances', async () => {
      jest.spyOn(service, 'uploadAvatarImage');
      
      await service.uploadAvatarImage(userMock, fileMock);

      expect(service.uploadAvatarImage).toHaveBeenCalledWith(userMock, fileMock);
    });

    it('should return a User intance', async () => {
      const result: User = await service.uploadAvatarImage(userMock, fileMock);

      expect(result instanceof User).toBeTruthy();
    });

    it('should throw a BadRequestException if no image is sended', async () => {
      const execute = async () => await service.uploadAvatarImage(userMock, null);

      await expect(execute).rejects.toThrowError(BadRequestException);
    });

    it('should throw a specific error message if no image is sended', async () => {
      const expectedErrorMessage: string = 'Avatar image is required';

      const execute = async () => await service.uploadAvatarImage(userMock, null);

      await expect(execute).rejects.toThrowError(expectedErrorMessage);
    });

    it('should call uploadPublicFile method from the fileService with their respective arguments', async () => {
      await service.uploadAvatarImage(userMock, fileMock);

      expect(fileSpyService.uploadPublicFile).toHaveBeenCalledTimes(1);
      expect(fileSpyService.uploadPublicFile).toHaveBeenCalledWith(
        userMock.cognitoId,
        fileMock.buffer,
        fileMock.originalname,
        fileMock.fieldname,
      );
    });

    it('should return the same user instance passed as argument but, with the profilePictureKey returned from uploadPublicFile Method', async () => {
      const expectedNewKey: string = 'newKey';
      const expectedUser: User = new User();
      expectedUser.userId = userMock.userId;
      expectedUser.name = userMock.name;
      expectedUser.phoneNumber = userMock.phoneNumber;
      expectedUser.profilePictureKey = expectedNewKey;
      expectedUser.cognitoId = userMock.cognitoId;
      expectedUser.createdAt = userMock.createdAt;
      expectedUser.updatedAt = userMock.updatedAt;
      fileSpyService.uploadPublicFile.mockReturnValue((async () => {
        return { Key: expectedNewKey } as S3.ManagedUpload.SendData
      })());

      const result: User = await service.uploadAvatarImage(userMock, fileMock);

      expect(result.profilePictureKey).toBe(expectedNewKey);
      expect(result).toStrictEqual(
        expect.objectContaining(expectedUser)
      );
    });

    it('should call deletePublicFile method from the fileService with the old profilePictureKey', async () => {
      const oldProfilePictureKey: string = 'oldKey';
      userMock.profilePictureKey = oldProfilePictureKey;
      fileSpyService.uploadPublicFile.mockReturnValue((async () => {
        return { Key: 'newKey' } as S3.ManagedUpload.SendData
      })());

      await service.uploadAvatarImage(userMock, fileMock);

      expect(fileSpyService.deletePublicFile).toHaveBeenCalledTimes(1);
      expect(fileSpyService.deletePublicFile).toHaveBeenCalledWith(oldProfilePictureKey);
    });

    it('should call updatePictureKey method from usersService with the userId and the new profilePictureKey', async () => {
      const newProfilePictureKey: string = 'newKey';
      userMock.userId = 'aUserId';
      fileSpyService.uploadPublicFile.mockReturnValue((async () => {
        return { Key: newProfilePictureKey } as S3.ManagedUpload.SendData
      })());

      await service.uploadAvatarImage(userMock, fileMock);

      expect(usersSpyService.updatePictureKey).toHaveBeenCalledTimes(1);
      expect(usersSpyService.updatePictureKey).toHaveBeenCalledWith(userMock.userId, newProfilePictureKey);
    });
  });
});
