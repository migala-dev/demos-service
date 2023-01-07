import {
  BadRequestException,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { InternalServerErrorException } from '@nestjs/common';

import { createSpyObj } from 'jest-createspyobj';
import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { IsUserASpaceMemberGuard } from './is-user-a-space-member.guard';
import { MemberRepository } from '../../database/services/member.repository';
import { SpaceRepository } from '../../database/services/space.repository';
import { Member } from '../../database/entities/member.entity';
import { Space } from '../../database/entities/space.entity';
import { ParamsWithSpaceId } from '../../interfaces/params.interface';
import { SpaceMemberRequest } from '../../interfaces/request.interface';
import {
  spaceMockFactory,
  memberMockFactory,
} from '../../../../test/utils/entities-mock.factory';

describe('IsUserASpaceMemberGuard', () => {
  let guard: IsUserASpaceMemberGuard;
  let membersSpyService: jest.Mocked<MemberRepository>;
  let spacesSpyService: jest.Mocked<SpaceRepository>;

  beforeEach(() => {
    membersSpyService = createSpyObj(MemberRepository);
    spacesSpyService = createSpyObj(SpaceRepository);

    guard = new IsUserASpaceMemberGuard(membersSpyService, spacesSpyService);
  });

  describe('canActivate method', () => {
    let executionContextMock: jest.Mocked<ExecutionContext>;
    let httpArgumentsHost: jest.Mocked<HttpArgumentsHost>;
    let requestObjectMock: jest.Mocked<SpaceMemberRequest<ParamsWithSpaceId>>;

    let chance: Chance.Chance;

    beforeEach(() => {
      executionContextMock = mock<ExecutionContext>();
      httpArgumentsHost = mock<HttpArgumentsHost>();
      requestObjectMock = mock<SpaceMemberRequest<ParamsWithSpaceId>>();

      chance = new Chance();

      httpArgumentsHost.getRequest.mockReturnValue(requestObjectMock);
      executionContextMock.switchToHttp.mockReturnValue(httpArgumentsHost);

      membersSpyService.findOneByUserIdAndSpaceId.mockReturnValue(
        (async () => ({} as Member))(),
      );
      spacesSpyService.findOneById.mockReturnValue(
        (async () => ({} as Space))(),
      );
    });

    it('should throw an InternalServerErrorException if there is not a user in the request object', async () => {
      requestObjectMock.user = undefined;

      const execute = async () => await guard.canActivate(executionContextMock);

      await expect(execute).rejects.toThrowError(InternalServerErrorException);
    });

    it('should throw a BadRequestException if space not found', async () => {
      spacesSpyService.findOneById.mockReturnValue((async () => null)());

      const execute = async () => await guard.canActivate(executionContextMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
    });

    it('should throw an UnauthorizedException if the user is not a member of the space', async () => {
      membersSpyService.findOneByUserIdAndSpaceId.mockReturnValue(
        (async () => null)(),
      );

      const execute = async () => await guard.canActivate(executionContextMock);

      await expect(execute).rejects.toThrowError(UnauthorizedException);
    });

    it('should return true if the space exists and if the user is a member of that space', async () => {
      const result: boolean = await guard.canActivate(executionContextMock);

      expect(result).toBeTruthy();
    });

    it('should attach space and owner member to request object', async () => {
      const [spaceMock, memberMock] = await Promise.all([
        spaceMockFactory(chance),
        memberMockFactory(chance),
      ]);
      memberMock.spaceId = spaceMock.spaceId;
      memberMock.userId = spaceMock.ownerId;
      spacesSpyService.findOneById.mockReturnValue(
        (async () => ({ ...spaceMock } as Space))(),
      );
      membersSpyService.findOneByUserIdAndSpaceId.mockReturnValue(
        (async () => ({ ...memberMock } as Member))(),
      );

      await guard.canActivate(executionContextMock);

      expect(requestObjectMock.space).toStrictEqual(
        expect.objectContaining(spaceMock),
      );
      expect(requestObjectMock.member).toStrictEqual(
        expect.objectContaining(memberMock),
      );
    });
  });
});
