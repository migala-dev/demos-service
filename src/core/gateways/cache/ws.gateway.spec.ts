import { Test, TestingModule } from '@nestjs/testing';
import { CacheGateway } from './cache.gateway';

describe('CacheGateway', () => {
  let gateway: CacheGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheGateway],
    }).compile();

    gateway = module.get<CacheGateway>(CacheGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
