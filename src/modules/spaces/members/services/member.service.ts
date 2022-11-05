import { Injectable } from '@nestjs/common';

import { Space } from '../../../../core/database/entities/space.entity';
import { Member } from '../../../../core/database/entities/member.entity';
import { User } from '../../../../core/database/entities/user.entity';
import { UserToInviteModel } from '../models/user-to-invite.model';
import { UsersService } from '../../../../core/database/services/user.service';
import { MembersService } from '../../../../core/database/services/member.service';
import { SpaceRole, InvitationStatus } from '../../../../core/enums';

@Injectable()
export class MemberService {
  constructor(
    private readonly usersService: UsersService,
    private readonly membersService: MembersService,
  ) {}

  public async sendInvitations(
    space: Space,
    member: Member,
    usersToInvite: UserToInviteModel[],
  ): Promise<Member[]> {
    const createdBy: string = member.userId;
    const invitations: Member[] = await Promise.all(
      usersToInvite.map(
        async (userToInvite) =>
          await this.createInvitation(userToInvite, space.spaceId, createdBy),
      ),
    );

    return invitations;
  }

  private async createInvitation(
    userToInvite: UserToInviteModel,
    spaceId: string,
    createdBy: string,
  ): Promise<Member> {
    let { userId } = userToInvite;
    const { phoneNumber } = userToInvite;

    if (!userId && phoneNumber) {
      userId = await this.getUserId(phoneNumber);
    }

    return this.getMember(spaceId, userId, createdBy);
  }

  private async getUserId(phoneNumber: string): Promise<string> {
    const user = await this.usersService.findOneByPhoneNumber(phoneNumber);
    if (!user) {
      const userCreated = await this.usersService.saveUser({
        phoneNumber,
      } as User);

      return userCreated.userId;
    }

    return user.userId;
  }

  private async getMember(
    spaceId: string,
    userId: string,
    createdBy: string,
  ): Promise<Member> {
    const member = await this.membersService.findOneByUserIdAndSpaceId(
      userId,
      spaceId,
    );
    if (!member) {
      const memberCreated = await this.membersService.create(
        spaceId,
        userId,
        InvitationStatus.SENDED,
        SpaceRole.WORKER,
        createdBy,
      );

      return memberCreated;
    }

    return member;
  }
}
