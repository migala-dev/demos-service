import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';

import { Member } from '../entities/member.entity';
import { InvitationStatus } from '../../enums/invitation-status.enum';

@Injectable()
export class MembersService {
  constructor(private readonly membersRepository: Repository<Member>) {}

  create(
    spaceId: string,
    userId: string,
    invitationStatus: number,
    role: string,
    createdBy: string,
  ): Promise<Member> {
    const newMember: Member = new Member();
    newMember.spaceId = spaceId;
    newMember.userId = userId;
    newMember.invitationStatus = invitationStatus;
    newMember.role = role;
    newMember.createdBy = createdBy;
    newMember.updatedBy = createdBy;
    if (invitationStatus === InvitationStatus.SENDED) {
      newMember.setExpireAt();
    }

    return this.membersRepository.save(newMember);
  }
}
