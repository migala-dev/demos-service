import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { TestingModule, Test } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';

import { createSpyObj } from 'jest-createspyobj';

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflectorSpy: jest.Mocked<Reflector>;
  let context: ExecutionContext;

  beforeEach(async () => {
    reflectorSpy = createSpyObj(Reflector);

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard, { provide: Reflector, useValue: reflectorSpy }],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);

    context = new ExecutionContextHost([]);
  });

  describe('canActive method', () => {
    it('should return true if the endpoint is public', () => {
      reflectorSpy.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBeTruthy();
    });

    it('should return false if the endpoint is not public', () => {
      reflectorSpy.getAllAndOverride.mockReturnValue(false);
      jest.spyOn(AuthGuard('jwt').prototype, 'canActivate').mockReturnValue(false);

      const result = guard.canActivate(context);

      expect(result).not.toBeTruthy();
    });
  });
});
