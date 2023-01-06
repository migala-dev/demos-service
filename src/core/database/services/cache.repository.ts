import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOperator, MoreThan, Repository } from 'typeorm';
import { Cache } from '../entities/cache.entity';

@Injectable()
export class CacheRepository {
  constructor(
    @InjectRepository(Cache)
    private readonly cacheRepository: Repository<Cache>,
  ) {}

  public async findAllByUserIdAfterDate(
    userId: string,
    afterDate?: Date,
  ): Promise<Cache[]> {
    return this.cacheRepository.find({
      where: {
        userId,
        createdAt: !!afterDate ? MoreThan(afterDate) : undefined,
      },
    });
  }

  public async create(
    entityName: string,
    eventName: string,
    userId: string,
    data: string,
  ): Promise<void> {
    const newCache = new Cache();
    newCache.entityName = entityName;
    newCache.eventName = eventName;
    newCache.userId = userId;
    newCache.data = JSON.stringify(data);

    this.cacheRepository.create(newCache);
  }
}
