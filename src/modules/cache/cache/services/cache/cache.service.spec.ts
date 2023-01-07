import { Test, TestingModule } from '@nestjs/testing';
import { createSpyObj } from 'jest-createspyobj';
import { loginConstants } from '../../../../../../test/mocks/constants/constants';
import { CacheRepository } from '../../../../../core/database/services/cache.repository';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let cacheSpyRepository: jest.Mocked<CacheRepository>;

  beforeEach(async () => {
    cacheSpyRepository = createSpyObj(CacheRepository);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CacheRepository,
          useValue: cacheSpyRepository,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get cache from cache repository', async () => {
    const userId = loginConstants.userId;
    const lastUpdatedDate: string = new Date().toDateString();
    await service.getCache(userId, lastUpdatedDate);

    expect(cacheSpyRepository.findAllByUserIdAfterDate).toHaveBeenCalledTimes(
      1,
    );
    expect(cacheSpyRepository.findAllByUserIdAfterDate).toHaveBeenCalledWith(
      loginConstants.userId,
      new Date(lastUpdatedDate),
    );
  });
});
