import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('Login Call', () => {
    it('should return the session with a correct phone number', () => {
      
    });
  });
});
