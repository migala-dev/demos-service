import { Injectable } from '@nestjs/common';

import { Member } from '../../../../database/entities/member.entity';
import { MembersService } from '../../../../database/services/member.service';
import { CacheEmitterService } from '../../../cache-emitter/cache-emitter.service';

@Injectable()
export class NotifierService {
  constructor(
    private readonly membersService: MembersService,
    private readonly cacheEmitterService: CacheEmitterService,
  ) {}

  public async notifyEachActiveMemberOn(
    generateCache: (member: Member) => Promise<void>,
    spaceId: string,
    exceptForUserId?: string,
  ): Promise<void> {
    const members: Member[] =
      await this.membersService.findBySpaceIdAndInvitationStatusAccepted(
        spaceId,
      );

    members.forEach(async (member) => {
      if (exceptForUserId !== member.userId) {
        await generateCache(member);
        this.cacheEmitterService.issueCacheUpdate(member.userId);
      }
    });
  }
}
