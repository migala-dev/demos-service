import { Injectable } from '@nestjs/common';

import { CacheService } from '../../../database/services/cache.service';
import { Cache } from '../../../database/entities/cache.entity';
import { entityNames } from '../../../constants/entity-names';
import { eventNames } from '../../../constants/event-names';
import { CacheEmitterService } from '../../cache-emitter/cache-emitter.service';
import { NotifierService } from '../utils/notifier/notifier.service';
import { Member } from '../../../database/entities/member.entity';

@Injectable()
export class MemberNotificationService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly cacheEmitter: CacheEmitterService,
    private readonly notifierService: NotifierService,
  ) {}

  public async newInvitation(spaceId: string, userId: string): Promise<void> {
    const data = { spaceId };
    await this.createMemberCache(eventNames.INVITATION, userId, data);
    this.cacheEmitter.issueCacheUpdate(userId);
  }
  
  public memberUpdated(spaceId: string, memberId: string): void {
    this.notifierService.notifyEachActiveMemberOn(async (member: Member) => {
      const data = { memberId, spaceId };
      await this.createMemberCache(eventNames.UPDATED, member.userId, data);
    }, spaceId);
  }

  private createMemberCache(
    eventName: string,
    userId: string,
    data: unknown,
  ): Promise<Cache> {
    const memberCacheInstance = new Cache();
    memberCacheInstance.entityName = entityNames.MEMBERS;
    memberCacheInstance.eventName = eventName;
    memberCacheInstance.userId = userId;
    memberCacheInstance.data = JSON.stringify(data);

    return this.cacheService.save(memberCacheInstance);
  }
}
