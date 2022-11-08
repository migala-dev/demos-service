import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { createSpyObj } from 'jest-createspyobj';
import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { SpaceRolesGuard } from './space-roles.guard';
import { SpaceRole } from '../../enums';
import { memberMockFactory } from '../../../../test/utils/entities-mock.factory';
import { RequestWithMember } from '../../interfaces/request.interface';

describe('SpaceRolesGuard', () => {
  let guard: SpaceRolesGuard;
  let reflectorSpy: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflectorSpy = createSpyObj(Reflector);

    guard = new SpaceRolesGuard(reflectorSpy);
  });

  describe('canActivate method', () => {
    let executionContextMock: jest.Mocked<ExecutionContext>;
    let httpArgumentsHost: jest.Mocked<HttpArgumentsHost>;
    let requestObjectMock: jest.Mocked<RequestWithMember>;

    let chance: Chance.Chance;

    beforeEach(() => {
      executionContextMock = mock<ExecutionContext>();
      httpArgumentsHost = mock<HttpArgumentsHost>();
      requestObjectMock = mock<RequestWithMember>();

      chance = new Chance();

      httpArgumentsHost.getRequest.mockReturnValue(requestObjectMock);
      executionContextMock.switchToHttp.mockReturnValue(httpArgumentsHost);

      reflectorSpy.getAllAndOverride.mockReturnValue([
        SpaceRole.ADMIN,
        SpaceRole.REPRESENTATIVE,
      ] as SpaceRole[]);
    });

    it('should return true if no space role is required', () => {
      reflectorSpy.getAllAndOverride.mockReturnValue([] as SpaceRole[]);

      const result: boolean = guard.canActivate(executionContextMock);

      expect(result).toBeTruthy();
    });

    it('should throw an InternalServerErrorException if there is not a member in the request object', () => {
      requestObjectMock.member = undefined;

      const execute = () => guard.canActivate(executionContextMock);

      expect(execute).toThrowError(InternalServerErrorException);
    });

    it('should throw an UnauthorizedException if member not contains any required role', async () => {
      requestObjectMock.member = await memberMockFactory(chance);
      requestObjectMock.member.role = SpaceRole.WORKER;

      const execute = () => guard.canActivate(executionContextMock);

      expect(execute).toThrowError(UnauthorizedException);
    });

    it('should return true if member has any role required', async () => {
      requestObjectMock.member = await memberMockFactory(chance);
      requestObjectMock.member.role = SpaceRole.REPRESENTATIVE;

      const result: boolean = guard.canActivate(executionContextMock);

      expect(result).toBeTruthy();
    });
  });
});
