import { Injectable } from '@nestjs/common';

import { SpaceRepository } from '../../../../../core/database/services/space.repository';
import { MemberRepository } from '../../../../../core/database/services/member.repository';
import { Space } from '../../../../../core/database/entities/space.entity';
import { InvitationStatus, SpaceRole } from '../../../../../core/enums';
import { Member } from '../../../../../core/database/entities/member.entity';
import { CreateSpaceResponse } from '../../response/create.response';
import { User } from '../../../../../core/database/entities/user.entity';
import { UpdateSpaceInfoDto } from '../../dtos/update-space-info.dto';

@Injectable()
export class SpaceService {
  constructor(
    private readonly spaceRepository: SpaceRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  public async createSpaceAndOwnerMember(
    userId: string,
    name: string,
    description: string,
    approvalPercentage: number,
    participationPercentage: number,
  ): Promise<CreateSpaceResponse> {
    const space: Space = await this.spaceRepository.create(
      userId,
      name,
      description,
      approvalPercentage,
      participationPercentage,
    );

    const member: Member = await this.memberRepository.create(
      space.spaceId,
      userId,
      InvitationStatus.ACCEPTED,
      SpaceRole.ADMIN,
      userId,
    );

    return { space, member };
  }

  public async updateSpaceInfo(
    user: User,
    space: Space,
    spaceInfo: UpdateSpaceInfoDto,
  ): Promise<Space> {
    await this.spaceRepository.updateNameAndDescriptionAndPercentages(
      space.spaceId,
      spaceInfo.name,
      spaceInfo.description,
      spaceInfo.approvalPercentage,
      spaceInfo.participationPercentage,
    );

    const spaceUpdated: Space = await this.spaceRepository.findOneById(
      space.spaceId,
    );

    return spaceUpdated;
  }
}
