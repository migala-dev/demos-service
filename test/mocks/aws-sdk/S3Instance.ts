import { S3 } from 'aws-sdk';

export const S3InstanceMock = {
  upload: jest.fn().mockReturnThis(),
  promise: jest.fn().mockReturnValue({
    Location: '',
    ETag: '',
    Bucket: '',
    Key: '',
  } as S3.ManagedUpload.SendData),
  deleteObject: jest.fn().mockReturnThis(),
};
