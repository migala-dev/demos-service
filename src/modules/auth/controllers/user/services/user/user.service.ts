import { BadRequestException, Injectable } from '@nestjs/common';

import { FileService } from '../file/file.service';
import { User } from '../../../../../../core/database/entities/user.entity';
import { UsersService } from '../../../../../../core/database/services/user.service';
import { UploadResponse } from '../file/response/upload.response';

@Injectable()
export class UserService {
  constructor(
    private readonly fileService: FileService,
    private readonly usersService: UsersService,
  ) {}

  public async updateUserName(
    user: User,
    name: string,
  ): Promise<User> {
    if (!name) throw new EvalError('User name is empty');
    return this.usersService.updateUserName(user.userId, name);
  }

  public async uploadAvatarImage(
    user: User,
    file: Express.Multer.File,
  ): Promise<User> {
    if (!file) throw new BadRequestException('Avatar image is required');

    const oldImageKey: string = user.profilePictureKey;

    const uploadResponse: UploadResponse =
      await this.fileService.uploadPublicFile(
        user.cognitoId,
        file.buffer,
        file.originalname,
        file.fieldname,
      );

    user.profilePictureKey = uploadResponse.imageKey;

    this.fileService.deletePublicFile(oldImageKey);

    await this.usersService.updatePictureKey(
      user.userId,
      uploadResponse.imageKey,
    );

    return user;
  }
}
