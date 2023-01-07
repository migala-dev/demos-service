import { Module } from '@nestjs/common';
import { CacheController } from './cache/cache.controller';
import { CacheService } from './cache/services/cache/cache.service';

@Module({
  controllers: [CacheController],
  providers: [CacheService],
})
export class CacheModule {}
