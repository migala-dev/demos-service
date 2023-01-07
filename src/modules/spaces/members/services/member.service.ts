import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { Space } from '../../../../core/database/entities/space.entity';
import { Member } from '../../../../core/database/entities/member.entity';
import { User } from '../../../../core/database/entities/user.entity';
import { UserRepository } from '../../../../core/database/services/user.repository';
import { MemberRepository } from '../../../../core/database/services/member.repository';
import { SpaceRole, InvitationStatus } from '../../../../core/enums';
import { UserToInviteDto } from '../dtos/user-to-invite.dto';

@Injectable()
export class MemberService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  public async sendInvitations(
    space: Space,
    member: Member,
    usersToInvite: UserToInviteDto[],
  ): Promise<Member[]> {
    const createdBy: string = member.userId;
    const invitations: Member[] = await Promise.all(
      usersToInvite.map(async (userToInvite) => {
        try {
          return await this.createInvitation(
            userToInvite,
            space.spaceId,
            createdBy,
          );
        } catch (err) {
          Logger.error(err);
          return null;
        }
      }),
    );

    return invitations.filter((invitation) => !!invitation);
  }

  private async createInvitation(
    userToInvite: UserToInviteDto,
    spaceId: string,
    createdBy: string,
  ): Promise<Member> {
    let { userId } = userToInvite;
    const { phoneNumber } = userToInvite;

    if (userId) {
      await this.validateUserId(userId);
    }

    if (!userId && phoneNumber) {
      userId = await this.getValidUserId(phoneNumber);
    }

    const member = await this.memberRepository.findOneByUserIdAndSpaceId(
      userId,
      spaceId,
    );
    if (!member) {
      const newMember: Member = await this.createNewMember(
        spaceId,
        userId,
        createdBy,
      );

      return newMember;
    }

    return member;
  }

  private async validateUserId(userId: string): Promise<string> {
    const user: User = await this.userRepository.findOneById(userId);
    if (!user)
      throw new BadRequestException(`User with ${userId} user id not found`);

    return user.userId;
  }

  private async getValidUserId(phoneNumber: string): Promise<string> {
    const user: User = await this.userRepository.findOneByPhoneNumber(
      phoneNumber,
    );
    if (!user) {
      const newUser: User = await this.createNewUser(phoneNumber);

      return newUser.userId;
    }

    return user.userId;
  }

  private async createNewUser(phoneNumber: string): Promise<User> {
    const user: User = new User();
    user.phoneNumber = phoneNumber;

    const newUser: User = await this.userRepository.saveUser(user);

    return newUser;
  }

  private async createNewMember(
    spaceId: string,
    userId: string,
    createdBy: string,
  ): Promise<Member> {
    const newMember: Member = await this.memberRepository.create(
      spaceId,
      userId,
      InvitationStatus.SENDED,
      SpaceRole.WORKER,
      createdBy,
    );

    return newMember;
  }
}
