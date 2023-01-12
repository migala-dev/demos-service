import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { Member } from '../entities/member.entity';
import { InvitationStatus, SpaceRole } from '../../enums';
import { MemberStatussesUtil } from '../../utils/members-statusses.utils';

@Injectable()
export class MemberRepository {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
  ) {}

  public create(
    spaceId: string,
    userId: string,
    invitationStatus: InvitationStatus,
    role: SpaceRole,
    createdBy: string,
  ): Promise<Member> {
    const newMember: Member = new Member();
    newMember.spaceId = spaceId;
    newMember.userId = userId;
    newMember.invitationStatus = invitationStatus;
    newMember.role = role;
    newMember.createdBy = createdBy;
    newMember.updatedBy = createdBy;

    return this.membersRepository.save(newMember);
  }

  public findOneByUserIdAndSpaceId(userId: string, spaceId: string) {
    return this.membersRepository.findOneBy({ userId, spaceId });
  }

  public async findAllActiveMemberBySpaceIds(
    spaceIds: string[],
  ): Promise<Member[]> {
    const memberActiveStatusses = MemberStatussesUtil.getActiveStatusses();

    const members = await this.membersRepository.find({
      where: {
        spaceId: In(spaceIds),
        invitationStatus: In(memberActiveStatusses),
      },
    });

    return members;
  }

  public async updateInvitationStatus(
    memberId: string,
    invitationStatus: InvitationStatus,
    updatedBy: string,
  ): Promise<void> {
    const member = this.membersRepository.create({
      invitationStatus,
      updatedBy,
    });
    await this.membersRepository.update(memberId, member);
  }
}
