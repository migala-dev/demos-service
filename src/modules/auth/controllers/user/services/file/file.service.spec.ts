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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadPublicFile method', () => {
    let cognitoIdMock: string;
    let dataBufferMock: Buffer;
    let filenameMock: string;
    let fieldnameMock: string;

    beforeEach(() => {
      cognitoIdMock = '';
      dataBufferMock = {} as Buffer;
      filenameMock = '';
      fieldnameMock = '';
    });

    it('should be defined', () => {
      expect(service.uploadPublicFile).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof service.uploadPublicFile).toBe('function');
    });

    it('should be an async function', () => {
      const string: string = service.uploadPublicFile.toString();

      const isAsync: boolean = string.includes('async');

      expect(isAsync).toBeTruthy();
    });

    it('should be called with 3 strings a cognitoId, a filename, a fieldname, and dataBuffer of type Buffer', async () => {
      jest.spyOn(service, 'uploadPublicFile');

      await service.uploadPublicFile(
        cognitoIdMock,
        dataBufferMock,
        filenameMock,
        fieldnameMock,
      );

      expect(service.uploadPublicFile).toHaveBeenCalled();
      expect(service.uploadPublicFile).toHaveBeenCalledWith(
        cognitoIdMock,
        dataBufferMock,
        filenameMock,
        fieldnameMock,
      );
    });

    it('should return an object that implements UploadResponse', async () => {
      const result: UploadResponse = await service.uploadPublicFile(
        cognitoIdMock,
        dataBufferMock,
        filenameMock,
        fieldnameMock,
      );

      expect('imageKey' in result).toBeTruthy();
    });

    it('should call upload method from S3 instance with ACL, Body, Bucket, Key, and Metadata as arguments', async () => {
      jest.spyOn(String.prototype, 'slice').mockReturnValue('1234');
      const expectedACL: string = 'public-read';
      const expectedBody: Buffer = {} as Buffer;
      const expectedBucket: string = 'aTestBucket';
      const expectedKey: string = 'avatars/.1234.';
      const expectedFieldName: string = 'aTestFieldName';
      const expectedMetadata: { fieldName: string } = {
        fieldName: expectedFieldName,
      };
      dataBufferMock = expectedBody;
      fieldnameMock = expectedFieldName;
      configSpyService.get.mockReturnValue(expectedBucket);

      await service.uploadPublicFile(
        cognitoIdMock,
        dataBufferMock,
        filenameMock,
        fieldnameMock,
      );

      expect(S3InstanceMock.upload).toHaveBeenCalledTimes(1);
      expect(S3InstanceMock.upload).toHaveBeenCalledWith({
        ACL: expectedACL,
        Body: expectedBody,
        Bucket: expectedBucket,
        Key: expectedKey,
        Metadata: expectedMetadata,
      });
    });

    it('should return the same object returned from upload method', async () => {
      const expectedLocation: string = 'aLocation';
      const expectedETag: string = 'anETag';
      const expectedBucket: string = 'aBucket';
      const expectedImageKey: string = 'aKey';
      const expectedResult: UploadResponse = {
        imageKey: expectedImageKey
      };
      S3InstanceMock.promise.mockReturnValue({
        Location: expectedLocation,
        ETag: expectedETag,
        Bucket: expectedBucket,
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

    it('should be defined', () => {
      expect(service.deletePublicFile).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof service.deletePublicFile).toBe('function');
    });

    it('should be called with an imageKey of type string as argument', () => {
      jest.spyOn(service, 'deletePublicFile');

      service.deletePublicFile(imageKeyMock);

      expect(service.deletePublicFile).toHaveBeenCalled();
      expect(service.deletePublicFile).toHaveBeenCalledWith(imageKeyMock);
    });

    it('should not return anything', () => {
      const result = service.deletePublicFile(imageKeyMock);

      expect(result).toBeUndefined();
    });

    it('should call deleteObject method from s3 instance with a params and a callback function', () => {
      jest.spyOn(S3InstanceMock, 'deleteObject');
      const bucketMock: string = 'aTestBucket';
      const keyMock: string = 'aTestImageKey';
      const paramsMock: S3.DeleteObjectRequest = {
        Bucket: bucketMock,
        Key: keyMock,
      };
      configSpyService.get.mockReturnValue(bucketMock);

      service.deletePublicFile(imageKeyMock);

      expect(S3InstanceMock.deleteObject).toHaveBeenCalledTimes(1);
      expect(S3InstanceMock.deleteObject).toHaveBeenCalledWith(
        paramsMock,
        expect.any(Function),
      );
    });
  });
});
