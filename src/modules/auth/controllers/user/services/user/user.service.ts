import { BadRequestException, Injectable } from '@nestjs/common';

import { FileService } from '../file/file.service';
import { User } from '../../../../../../core/database/entities/user.entity';
import { UserRepository } from '../../../../../../core/database/services/user.repository';
import { UploadResponse } from '../file/response/upload.response';

@Injectable()
export class UserService {
  constructor(
    private readonly fileService: FileService,
    private readonly userRepository: UserRepository,
  ) {}

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

    await this.userRepository.updatePictureKey(
      user.userId,
      uploadResponse.imageKey,
    );

    return user;
  }
}
