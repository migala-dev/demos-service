import { Test, TestingModule } from '@nestjs/testing';
import { CognitoService } from './cognito.service';
import { ConfigService } from '@nestjs/config';
import { loginConstants } from '../../../../../../../test/mocks/constants/constants';

describe('CognitoService', () => {
  let service: CognitoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CognitoService, ConfigService],
    }).compile();

    service = module.get<CognitoService>(CognitoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a cognito user not created', async () => {
    const phoneNumber = loginConstants.phoneNumberNotCreated;
    
    const cognitoUser = await service.signIn(phoneNumber);

    expect(cognitoUser.isUserCreated).toBe(false);
  })

  it('should return a cognito user created with the session', async () => {
    const phoneNumber = loginConstants.phoneNumber;
    
    const cognitoUser = await service.signIn(phoneNumber);

    expect(cognitoUser.isUserCreated).toBe(true);
    expect(cognitoUser.cognitoId).toBe(loginConstants.cognitoMockId);
    expect(cognitoUser.session).toBe(loginConstants.sessionMockToken);
  });

  it('should return create a cognito user and return the cognito id', async () => {
    const phoneNumber = loginConstants.phoneNumberNotCreated;

    const cognitoId = await service.signUp(phoneNumber);
    
    expect(cognitoId).toBe(loginConstants.cognitoMockId);
  });
});
