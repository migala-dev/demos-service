import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AWSError, S3 } from 'aws-sdk';

import { UploadResponse } from './response/upload.response';

@Injectable()
export class FileService {
  private s3: S3 = new S3();

  constructor(private readonly configService: ConfigService) {}

  public async uploadPublicFile(
    cognitoId: string,
    dataBuffer: Buffer,
    filename: string,
    fieldname: string,
  ): Promise<UploadResponse> {
    const imageKey: string = this.generateImageKey(cognitoId, filename);

    const uploadResult: S3.ManagedUpload.SendData = await this.s3
      .upload({
        ACL: 'public-read',
        Body: dataBuffer,
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key: imageKey,
        Metadata: { fieldName: fieldname },
      })
      .promise();

    return { imageKey: uploadResult.Key };
  }

  private generateImageKey(cognitoId: string, filename: string): string {
    const fileExtension: string = this.getFileExtension(filename);
    const randomNumber: string = new Date().getTime().toString().slice(9);

    return `avatars/${cognitoId}.${randomNumber}.${fileExtension}`;
  }

  private getFileExtension(filename: string): string {
    const splitFileName: string[] = filename.split('.');
    const fileExtension: string = splitFileName[splitFileName.length - 1];

    return fileExtension;
  }

  public deletePublicFile(imageKey: string): void {
    this.s3.deleteObject(
      {
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key: imageKey,
      },
      (err: AWSError) => {
        if (err) {
          Logger.error(`Can not delete: ${imageKey}`);
          Logger.error(`${err}`);
        }
      },
    );
  }
}
