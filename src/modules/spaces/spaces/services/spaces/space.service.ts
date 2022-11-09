import { Injectable } from '@nestjs/common';

import { SpacesService } from '../../../../../core/database/services/space.service';
import { MembersService } from '../../../../../core/database/services/member.service';
import { Space } from '../../../../../core/database/entities/space.entity';
import { InvitationStatus, SpaceRole } from '../../../../../core/enums';
import { Member } from '../../../../../core/database/entities/member.entity';
import { CreateSpaceResponse } from '../../response/create.response';

@Injectable()
export class SpaceService {
  constructor(
    private readonly spacesService: SpacesService,
    private readonly membersService: MembersService,
  ) {}

  public async createSpaceAndOwnerMember(
    userId: string,
    name: string,
    description: string,
    approvalPercentage: number,
    participationPercentage: number,
  ): Promise<CreateSpaceResponse> {
    const space: Space = await this.spacesService.create(
      userId,
      name,
      description,
      approvalPercentage,
      participationPercentage,
    );

    const member: Member = await this.membersService.create(
      space.spaceId,
      userId,
      InvitationStatus.ACCEPTED,
      SpaceRole.ADMIN,
      userId,
    );

    return { space, member };
  }
}
