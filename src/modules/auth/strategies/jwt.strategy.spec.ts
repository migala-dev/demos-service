import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';

import { JwtStrategy } from './jwt.strategy';
import { User } from '../../../core/database/entities/user.entity';
import { UsersService } from '../../../core/database/services/user.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersSpyService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    usersSpyService = createSpyObj(UsersService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy, { provide: UsersService, useValue: usersSpyService }],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate method', () => {
    let payload: { cognitoId: string };

    beforeEach(() => {
      payload = { cognitoId: '' };

      usersSpyService.findOneByCognitoId.mockReturnValue((async () => ({}) as User)())
    });

    it('should be define', () => {
      expect(strategy.validate).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof strategy.validate).toBe('function');
    });

    it('should be an async function', () => {
      const string: string = strategy.validate.toString();

      const isAsync: boolean = string.includes('async');

      expect(isAsync).toBeTruthy();
    });

    it('should be called with a payload as argument', () => {
      jest.spyOn(strategy, 'validate');

      strategy.validate(payload);

      expect(strategy.validate).toHaveBeenCalled();
      expect(strategy.validate).toHaveBeenCalledWith(payload);
    });

    it('should return a User instance', async () => {
      usersSpyService.findOneByCognitoId.mockReturnValue((async () => new User())())

      const result: User = await strategy.validate(payload);

      expect(result instanceof User).toBeTruthy();
    });

    it('should call findOneByCognitoId method from usersService', async () => {
      await strategy.validate(payload);

      expect(usersSpyService.findOneByCognitoId).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException error if no user is found', async () => {
      usersSpyService.findOneByCognitoId.mockReturnValue((async () => null)())

      const execute = async () => await strategy.validate(payload);

      await expect(execute).rejects.toThrow();
      await expect(execute).rejects.toThrowError(UnauthorizedException);
    });

    it('should return same user returned by findOneByCognitoId method if user is found', async () => {
      const expectedCognitoId: string = '';
      const expectedUser: User = new User();
      expectedUser.cognitoId = expectedCognitoId;
      usersSpyService.findOneByCognitoId.mockReturnValue((async () => expectedUser)())

      const result: User = await strategy.validate(payload);

      expect(result).toEqual(
        expect.objectContaining(expectedUser)
      );
    });

    it('should return user with the same cognitoId passed to the method if user is found', async () => {
      const expectedCognitoId: string = 'Test';
      payload = { cognitoId: expectedCognitoId }
      const expectedUser: User = new User();
      expectedUser.cognitoId = expectedCognitoId;
      usersSpyService.findOneByCognitoId.mockReturnValue((async () => expectedUser)())

      const result: User = await strategy.validate(payload);

      expect(result).toEqual(
        expect.objectContaining(expectedUser)
      );
    });
  });
});
