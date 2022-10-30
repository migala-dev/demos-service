import { Reflector } from '@nestjs/core';
import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { createSpyObj } from 'jest-createspyobj';
import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { SpaceRolesGuard } from './space-roles.guard';
import { SpaceRole } from '../../enums';
import { memberMockFactory } from '../../../../test/utils/entities-mock.factory';
import { Member } from '../../database/entities/member.entity';

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
    let requestObjectMock: jest.Mocked<any>;

    let chance: Chance.Chance;

    beforeEach(() => {
      executionContextMock = mock<ExecutionContext>();
      httpArgumentsHost = mock<HttpArgumentsHost>();
      requestObjectMock = mock<any>();

      chance = new Chance();

      httpArgumentsHost.getRequest.mockReturnValue(requestObjectMock);
      executionContextMock.switchToHttp.mockReturnValue(httpArgumentsHost);

      reflectorSpy.getAllAndOverride.mockReturnValue(
        (async () => ({} as SpaceRole[]))()
      );
    });

    it('should throw an InternalServerErrorException if there is not member in the request object', async () => {
      requestObjectMock.member = undefined;

      const execute = async () => await guard.canActivate(executionContextMock);

      await expect(execute).rejects.toThrowError(InternalServerErrorException);
    });

    it('should throw an UnauthorizedException if member has not any role', async () => {
      requestObjectMock.member = memberMockFactory(chance);

      const execute = async () => await guard.canActivate(executionContextMock);


    });
  });
});
