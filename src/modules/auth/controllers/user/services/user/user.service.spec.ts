import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { createSpyObj } from 'jest-createspyobj';
import { UpdateResult } from 'typeorm';

import { UserService } from './user.service';
import { User } from '../../../../../../core/database/entities/user.entity';
import { UserRepository } from '../../../../../../core/database/services/user.repository';
import { FileService } from '../file/file.service';
import { UploadResponse } from '../file/response/upload.response';
import { loginConstants } from '../../../../../../../test/mocks/constants/constants';
import { Space } from '../../../../../../core/database/entities/space.entity';
import { Member } from '../../../../../../core/database/entities/member.entity';
import { SpaceRepository } from '../../../../../../core/database/services/space.repository';
import { MemberRepository } from '../../../../../../core/database/services/member.repository';

describe('UserService', () => {
  let service: UserService;
  let fileSpyService: jest.Mocked<FileService>;
  let usersSpyRepository: jest.Mocked<UserRepository>;
  let spaceSpyRepository: jest.Mocked<SpaceRepository>;
  let memberSpyRepository: jest.Mocked<MemberRepository>;

  beforeEach(async () => {
    fileSpyService = createSpyObj(FileService);
    usersSpyRepository = createSpyObj(UserRepository);
    spaceSpyRepository = createSpyObj(SpaceRepository);
    memberSpyRepository = createSpyObj(MemberRepository);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: FileService,
          useValue: fileSpyService,
        },
        {
          provide: UserRepository,
          useValue: usersSpyRepository,
        },
        {
          provide: SpaceRepository,
          useValue: spaceSpyRepository,
        },
        {
          provide: MemberRepository,
          useValue: memberSpyRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    fileSpyService.uploadPublicFile.mockReturnValue(
      (async () => ({} as UploadResponse))(),
    );
    usersSpyRepository.updatePictureKey.mockReturnValue(
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

      expect(usersSpyRepository.updatePictureKey).toHaveBeenCalledTimes(1);
      expect(usersSpyRepository.updatePictureKey).toHaveBeenCalledWith(
        userMock.userId,
        newProfilePictureKey,
      );
    });


    it('should get recovered data', async () => {
      const userId = loginConstants.userId;

      const spacesExpected = [{ spaceId: 'space-1' } as Space, { spaceId: 'space-2' } as Space];
      const membersExpected = [{ userId: 'user-1' } as Member, { userId: 'user-2' } as Member];
      const usersExpected = [new User()];
      
      spaceSpyRepository.findAllActiveSpacesByUserId.mockReturnValue(
        (async () => spacesExpected)()
      );

      memberSpyRepository.findAllActiveMemberBySpaceIds.mockReturnValue(
        (async () => membersExpected)()
      );

      usersSpyRepository.findAllByUserIdsWithoutPhoneNumber.mockReturnValue(
        (async () => usersExpected)()
      );

      const result = await service.recoverUserData(userId);

      // SPACES
      expect(result.spaces).toBe(spacesExpected);
      expect(spaceSpyRepository.findAllActiveSpacesByUserId).toHaveBeenCalledWith(userId);

      // MEMBERS
      expect(result.members).toBe(membersExpected);  
      expect(memberSpyRepository.findAllActiveMemberBySpaceIds).toHaveBeenCalledWith(['space-1', 'space-2']);
    
      // USERS
      expect(result.users).toBe(usersExpected);
      expect(usersSpyRepository.findAllByUserIdsWithoutPhoneNumber).toHaveBeenCalledWith(['user-1', 'user-2']);

    });
  });
});
