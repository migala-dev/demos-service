import { BadRequestException, Injectable } from '@nestjs/common';
import { FileService } from '../file/file.service';
import { User } from '../../../../../../core/database/entities/user.entity';
import { UserRepository } from '../../../../../../core/database/services/user.repository';
import { UploadResponse } from '../file/response/upload.response';
import { RecoverData } from '../../models/recover-data.model';
import { SpaceRepository } from '../../../../../../core/database/services/space.repository';
import { MemberRepository } from '../../../../../../core/database/services/member.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly fileService: FileService,
    private readonly userRepository: UserRepository,
    private readonly spaceRepository: SpaceRepository,
    private readonly memberRepository: MemberRepository,
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

  public async recoverUserData(userId: string): Promise<RecoverData> {
    // SPACES
    const spaces = await this.spaceRepository.findAllActiveSpacesByUserId(
      userId,
    );
    // MEMBERS
    const spaceIds = spaces.map((space) => space.spaceId);
    const members = await this.memberRepository.findAllActiveMemberBySpaceIds(
      spaceIds,
    );

    // USERS
    const userIds = members.map((u) => u.userId);
    const users = await this.userRepository.findAllByUserIdsWithoutPhoneNumber(
      userIds,
    );

    return {
      spaces,
      members,
      users,
    };
  }
}
