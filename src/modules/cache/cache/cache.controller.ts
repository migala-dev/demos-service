import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Cache } from '../../../core/database/entities/cache.entity';
import { User } from '../../../core/database/entities/user.entity';
import { UserFromRequest } from '../../../core/decorators/auth/user-from-request/user-from-request.decorator';
import { GetCacheDto } from './dtos/get-cache.dto';
import { CacheService } from './services/cache/cache.service';

@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  public async getCache(
    @UserFromRequest() { userId }: User,
    @Body() { lastUpdatedDate }: GetCacheDto,
  ): Promise<Cache[]> {
    return this.cacheService.getCache(userId, lastUpdatedDate);
  }
}
