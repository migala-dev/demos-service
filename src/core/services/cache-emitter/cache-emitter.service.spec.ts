import { Test, TestingModule } from '@nestjs/testing';
import { CacheEmitterService } from './cache-emitter.service';

describe('CacheEmitterService', () => {
  let service: CacheEmitterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheEmitterService],
    }).compile();

    service = module.get<CacheEmitterService>(CacheEmitterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
