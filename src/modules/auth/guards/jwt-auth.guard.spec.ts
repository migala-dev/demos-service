import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { TestingModule, Test } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';

import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflectorSpy: jest.Mocked<Reflector>;
  let context: ExecutionContext;

  beforeEach(async ()  => {
    reflectorSpy = createSpyObj(Reflector);

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard, { provide: Reflector, useValue: reflectorSpy }],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);

    reflectorSpy.getAllAndOverride.mockReturnValue(true);

    context = new ExecutionContextHost([]);
  });

  it('should be define', () => {
    expect(guard).toBeDefined();
  });

  it('should be extends from AuthGuard(\'jwt\') class', () => {
    expect(guard instanceof AuthGuard('jwt'));
  });

  describe('canActive method', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof guard.canActivate).toBe('function');
    });

    it('should be called with a context of type ExecutionContext', () => {
      jest.spyOn(guard, 'canActivate');

      guard.canActivate(context);

      expect(guard.canActivate).toHaveBeenCalled();
      expect(guard.canActivate).toHaveBeenCalledWith(context);
    });

    it('should call getAllAndOverride method from reflector', () => {
      guard.canActivate(context);

      expect(reflectorSpy.getAllAndOverride).toHaveBeenCalled();
    });

    it('should return true if the value returned by getAllAndOverride method is true', () => {
      const result = guard.canActivate(context);

      expect(result).toBeTruthy();
    });
  });
});