import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';

import { JwtStrategy } from './jwt.strategy';
import { User } from '../../../core/database/entities/user.entity';
import { UserRepository } from '../../../core/database/services/user.repository';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersSpyService: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    usersSpyService = createSpyObj(UserRepository);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useValue: usersSpyService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate method', () => {
    let payload: { username: string };

    beforeEach(() => {
      payload = { username: 'aCognitoId' };

      usersSpyService.findOneByCognitoId.mockReturnValue(
        (async () => ({} as User))(),
      );
    });

    it('should find the user with the cognito id contained in the payload as username', async () => {
      await strategy.validate(payload);

      expect(usersSpyService.findOneByCognitoId).toHaveBeenCalledTimes(1);
      expect(usersSpyService.findOneByCognitoId).toHaveBeenCalledWith(
        payload.username,
      );
    });

    it('should throw UnauthorizedException error if the user is not found', async () => {
      usersSpyService.findOneByCognitoId.mockReturnValue((async () => null)());

      const execute = async () => await strategy.validate(payload);

      await expect(execute).rejects.toThrow();
      await expect(execute).rejects.toThrowError(UnauthorizedException);
    });

    it('should return the user if found', async () => {
      const userMock: User = new User();
      userMock.cognitoId = 'aCognitoId';
      const expectedCognitoId = userMock.cognitoId;
      const expectedUser: User = new User();
      expectedUser.cognitoId = expectedCognitoId;
      usersSpyService.findOneByCognitoId.mockReturnValue(
        (async () => userMock)(),
      );

      const result: User = await strategy.validate(payload);

      expect(result).toEqual(expect.objectContaining(expectedUser));
    });
  });
});
