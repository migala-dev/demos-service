import { Injectable } from '@nestjs/common';
import { CacheRepository } from '../../../../../core/database/services/cache.repository';
import { Cache } from '../../../../../core/database/entities/cache.entity';

@Injectable()
export class CacheService {
  constructor(private readonly cacheRepository: CacheRepository) {}

  public getCache(userId: string, lastUpdatedDate: string): Promise<Cache[]> {
    const afterDate: Date | null = !!lastUpdatedDate
      ? new Date(lastUpdatedDate)
      : null;
    return this.cacheRepository.findAllByUserIdAfterDate(userId, afterDate);
  }
}
