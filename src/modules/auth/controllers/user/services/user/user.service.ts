import { BadRequestException, Injectable } from '@nestjs/common';

import { S3 } from 'aws-sdk';

import { FileService } from '../file/file.service';
import { User } from '../../../../../../core/database/entities/user.entity';
import { UsersService } from '../../../../../../core/database/services/user.service';

@Injectable()
export class UserService {
  constructor(
    private readonly fileService: FileService,
    private readonly usersService: UsersService,
  ) {}

  public async uploadAvatarImage(user: User, file: Express.Multer.File): Promise<User> {
    if (!file) throw new BadRequestException('Avatar image is required');

    const oldImageKey: string = user.profilePictureKey;

    const uploadResult: S3.ManagedUpload.SendData = await this.fileService.uploadPublicFile(
      user.cognitoId,
      file.buffer,
      file.originalname,
      file.fieldname,
    );

    user.profilePictureKey = uploadResult.Key;

    this.fileService.deletePublicFile(oldImageKey);

    await this.usersService.updatePictureKey(user.userId, uploadResult.Key);

    return user;
  }
}
