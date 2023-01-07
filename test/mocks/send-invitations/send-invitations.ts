import { BadRequestException } from '@nestjs/common';

import { Chance } from 'chance';

import { Member } from '../../../src/core/database/entities/member.entity';
import { InvitationStatus, SpaceRole } from '../../../src/core/enums';
import {
  memberMockFactory,
  userMockFactory,
} from '../../utils/entities-mock.factory';
import { User } from '../../../src/core/database/entities/user.entity';
import { UserToInviteDto } from '../../../src/modules/spaces/members/dtos/user-to-invite.dto';

export const membersServiceCreateMock =
  (chance: Chance.Chance) =>
  async (
    spaceId: string,
    userId: string,
    invitationStatus: InvitationStatus,
    role: SpaceRole,
    createdBy: string,
  ) => {
    const newInvitation: Member = await memberMockFactory(chance);
    newInvitation.spaceId = spaceId;
    newInvitation.userId = userId;
    newInvitation.invitationStatus = invitationStatus;
    newInvitation.role = role;
    newInvitation.createdBy = createdBy;
    newInvitation.updatedBy = createdBy;

    return newInvitation;
  };

export const usersServiceFindOneByIdMock =
  (usersToInviteMock: UserToInviteDto[], chance: Chance.Chance) =>
  async (userId: string): Promise<User> => {
    if (userId === usersToInviteMock[0].userId) throw new BadRequestException();

    const user: User = await userMockFactory(chance);
    user.userId = userId;

    return user;
  };
