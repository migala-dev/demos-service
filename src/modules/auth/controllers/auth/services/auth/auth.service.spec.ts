import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { loginConstants } from '../../../../../../../test/mocks/constants/constants';
import { AuthService } from './auth.service';
import { CognitoService } from '../cognito/cognito.service';
import { createSpyObj } from 'jest-createspyobj';
import { CognitoUser } from '../../models/cognito-user.model';
import { UsersService } from 'src/core/database/services/user.service';

describe('AuthService', () => {
  let service: AuthService;
  let cognitoSpyService: jest.Mocked<CognitoService>;
  let userSpyService: jest.Mocked<UsersService>;

  beforeEach(async () => {
		cognitoSpyService = createSpyObj(CognitoService)
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: CognitoService,
          useValue: cognitoSpyService,
        },
        {
          provide: UsersService,
          useValue: userSpyService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return session-mock-value when the user login', async () => {
    const phoneNumber = loginConstants.phoneNumber;
    cognitoSpyService.signIn.mockReturnValue(
      (async () =>
        new CognitoUser(
          loginConstants.sessionMockToken,
          loginConstants.cognitoMockId,
        ))(),
    );

    const loginResponse = await service.login(phoneNumber);

    expect(loginResponse.session).toBe(loginConstants.sessionMockToken);
    expect(cognitoSpyService.signIn).toHaveBeenCalled();
    expect(cognitoSpyService.signIn).toHaveBeenCalledWith(phoneNumber);
  });


  it('should create a new user if the cognito id it was not found and there is no user created with that phone', () => {
    throw('not implemented')
  })

  it('should update the cognitoId if the cognito id it was not found and there is a user created with that phone', () => {
    throw('not implemented');
  });


  it('should do nothing if the cognito id was found on the database', async () => {
    const phoneNumber = loginConstants.phoneNumber;
    cognitoSpyService.signIn.mockReturnValue(
      (async () =>
        new CognitoUser(
          loginConstants.sessionMockToken,
          loginConstants.cognitoMockId,
        ))(),
    );

    const loginResponse = await service.login(phoneNumber);

    // Look cognitoId for the on the database
    userSpyService.findOneByCognitoId
    expect(userSpyService.findOneByCognitoId).toHaveBeenCalled();
			// if the user already exist it should update the cognitoId

  });

  it('should signUp the phoneNumber if the user does not exist on aws', async () => {
    const phoneNumber = loginConstants.phoneNumber;
    cognitoSpyService.signIn
      .mockReturnValueOnce((async () => CognitoUser.notCreated())())
      .mockReturnValue(
        (async () =>
          new CognitoUser(
            loginConstants.sessionMockToken,
            loginConstants.cognitoMockId,
          ))(),
      );

    const loginResponse = await service.login(phoneNumber);

    expect(cognitoSpyService.signIn.mock.calls.length).toBe(2);
    expect(cognitoSpyService.signUp).toHaveBeenCalled();
    expect(cognitoSpyService.signUp.mock.calls[0][0]).toBe(phoneNumber);
    expect(loginResponse.session).toBe(loginConstants.sessionMockToken);
  });
});
