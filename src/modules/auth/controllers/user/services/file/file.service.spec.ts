import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { createSpyObj } from 'jest-createspyobj';
import { S3 } from 'aws-sdk';

import { FileService } from './file.service';
import { S3InstanceMock } from '../../../../../../../test/mocks/aws-sdk/S3Instance';
import { UploadResponse } from './response/upload.response';

jest.mock('aws-sdk', () => ({ S3: jest.fn(() => S3InstanceMock) }));

describe('FileService', () => {
  let service: FileService;
  let configSpyService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    configSpyService = createSpyObj(ConfigService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: ConfigService,
          useValue: configSpyService,
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);

    configSpyService.get.mockReturnValue('');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('uploadPublicFile method', () => {
    let cognitoIdMock: string;
    let dataBufferMock: Buffer;
    let filenameMock: string;
    let fieldnameMock: string;

    beforeEach(() => {
      cognitoIdMock = 'aCognitoId';
      dataBufferMock = {} as Buffer;
      filenameMock = 'aFile.test';
      fieldnameMock = 'file';
    });

    it('should upload the file to aws bucket with some specified params', async () => {
      jest.spyOn(String.prototype, 'slice').mockReturnValue('1234');
      const bucketMock = 'aTestBucket';
      configSpyService.get.mockReturnValue(bucketMock);
      const expectedBuffer = dataBufferMock;
      const expectedKey = 'avatars/aCognitoId.1234.test';
      const expectedFieldName = fieldnameMock;
      const expectedBucket = bucketMock;
      const expectedParams: S3.PutObjectRequest = {
        ACL: 'public-read',
        Body: expectedBuffer,
        Bucket: expectedBucket,
        Key: expectedKey,
        Metadata: { fieldName: expectedFieldName },
      };

      await service.uploadPublicFile(
        cognitoIdMock,
        dataBufferMock,
        filenameMock,
        fieldnameMock,
      );

      expect(S3InstanceMock.upload).toHaveBeenCalledTimes(1);
      expect(S3InstanceMock.upload).toHaveBeenCalledWith(expectedParams);
    });

    it('should return an object with the uploaded file key', async () => {
      const expectedImageKey = 'aKey';
      const expectedResult: UploadResponse = {
        imageKey: expectedImageKey,
      };
      S3InstanceMock.promise.mockReturnValue({
        Key: expectedImageKey,
      } as S3.ManagedUpload.SendData);

      const result: UploadResponse = await service.uploadPublicFile(
        cognitoIdMock,
        dataBufferMock,
        filenameMock,
        fieldnameMock,
      );

      expect(result).toStrictEqual(expect.objectContaining(expectedResult));
    });
  });

  describe('deletePublicFile method', () => {
    let imageKeyMock: string;

    beforeEach(() => {
      imageKeyMock = 'aTestImageKey';
    });

    it('should not return anything', () => {
      const result = service.deletePublicFile(imageKeyMock);

      expect(result).toBeUndefined();
    });

    it('should delete the file from aws bucket with some specified params', () => {
      jest.spyOn(S3InstanceMock, 'deleteObject');
      const bucketMock = 'aTestBucket';
      const expectedBucket = bucketMock;
      const expectedKey = imageKeyMock;
      const expectedParams: S3.DeleteObjectRequest = {
        Bucket: expectedBucket,
        Key: expectedKey,
      };
      configSpyService.get.mockReturnValue(bucketMock);

      service.deletePublicFile(imageKeyMock);

      expect(S3InstanceMock.deleteObject).toHaveBeenCalledTimes(1);
      expect(S3InstanceMock.deleteObject).toHaveBeenCalledWith(
        expectedParams,
        expect.any(Function),
      );
    });
  });
});
