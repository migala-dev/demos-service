import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Cache } from '../entities/cache.entity';

@Injectable()
export class CacheService {
  constructor(
    @InjectRepository(Cache)
    private readonly cacheRepository: Repository<Cache>,
  ) {}

  public async save(cacheInstance: Partial<Cache>): Promise<Cache> {
    const newCache: Cache = await this.cacheRepository.save(cacheInstance);
    return newCache;
  }
}
