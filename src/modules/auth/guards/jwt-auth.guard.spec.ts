import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { TestingModule, Test } from '@nestjs/testing';

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

    reflectorSpy.getAllAndOverride.mockReturnValue(true);

    context = new ExecutionContextHost([]);
  });

  describe('canActive method', () => {
    it('should get metadata about if the enpoint is public or not', () => {
      guard.canActivate(context);

      expect(reflectorSpy.getAllAndOverride).toHaveBeenCalledTimes(1);
    });

    it('should return true if the endpoint is public', () => {
      const result = guard.canActivate(context);

      expect(result).toBeTruthy();
    });
  });
});
