import { Injectable } from '@nestjs/common';

import { CacheGateway } from '../../gateways/cache/cache.gateway';

@Injectable()
export class CacheEmitterService {
  private readonly eventNames: { [key: string]: string } = {
    newCache: 'cache:new',
  };

  constructor(private readonly cacheGateway: CacheGateway) {}

  public issueCacheUpdate(userId: string): void {
    this.cacheGateway.notifyUser(userId, this.eventNames['newCache']);
  }
}
