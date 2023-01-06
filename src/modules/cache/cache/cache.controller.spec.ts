import { Test, TestingModule } from '@nestjs/testing';
import { createSpyObj } from 'jest-createspyobj';
import { loginConstants } from '../../../../test/mocks/constants/constants';
import { User } from '../../../core/database/entities/user.entity';
import { CacheController } from './cache.controller';
import { CacheService } from './services/cache/cache.service';

describe('CacheController', () => {
  let controller: CacheController;
  let cacheSpyService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    cacheSpyService = createSpyObj(CacheService);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CacheController],
      providers: [
        {
          provide: CacheService,
          useValue: cacheSpyService,
        },
      ],
    }).compile();

    controller = module.get<CacheController>(CacheController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getCache method from cache service', async () => {
    const user = new User();
    user.userId = loginConstants.userId;
    const lastUpdatedDate: string = new Date().toDateString();
    await controller.getCache(user, { lastUpdatedDate });

    expect(cacheSpyService.getCache).toHaveBeenCalledTimes(1);
    expect(cacheSpyService.getCache).toHaveBeenCalledWith(
      loginConstants.userId,
      lastUpdatedDate,
    );
  });
});
