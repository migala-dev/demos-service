import { Test, TestingModule } from '@nestjs/testing';
import { MemberNotificationService } from './member-notification.service';

describe('MemberNotificationService', () => {
  let service: MemberNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberNotificationService],
    }).compile();

    service = module.get<MemberNotificationService>(MemberNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
