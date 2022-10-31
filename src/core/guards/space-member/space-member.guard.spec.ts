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

import { SpaceMemberGuard } from './space-member.guard';
import { MembersService } from '../../database/services/member.service';
import { SpacesService } from '../../database/services/space.service';
import { Member } from '../../database/entities/member.entity';
import { Space } from '../../database/entities/space.entity';
import { Params } from '../../interfaces/params.interface';
import { SpaceMemberRequest } from '../../interfaces/request.interface';
import {
  spaceMockFactory,
  memberMockFactory,
} from '../../../../test/utils/entities-mock.factory';

describe('SpaceMemberGuard', () => {
  let guard: SpaceMemberGuard;
  let membersSpyService: jest.Mocked<MembersService>;
  let spacesSpyService: jest.Mocked<SpacesService>;

  beforeEach(() => {
    membersSpyService = createSpyObj(MembersService);
    spacesSpyService = createSpyObj(SpacesService);

    guard = new SpaceMemberGuard(membersSpyService, spacesSpyService);
  });

  describe('canActivate method', () => {
    let executionContextMock: jest.Mocked<ExecutionContext>;
    let httpArgumentsHost: jest.Mocked<HttpArgumentsHost>;
    let requestObjectMock: jest.Mocked<SpaceMemberRequest<Params>>;

    let chance: Chance.Chance;

    beforeEach(() => {
      executionContextMock = mock<ExecutionContext>();
      httpArgumentsHost = mock<HttpArgumentsHost>();
      requestObjectMock = mock<SpaceMemberRequest<Params>>();

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

    it('should throw an InternalServerErrorException if there is no member in the request object', async () => {
      requestObjectMock.user = undefined;
      httpArgumentsHost.getRequest.mockReturnValue(requestObjectMock);

      const execute = async () => await guard.canActivate(executionContextMock);

      await expect(execute).rejects.toThrowError(InternalServerErrorException);
    });

    it('should throw a BadRequestException if space not found', async () => {
      spacesSpyService.findOneById.mockReturnValue((async () => null)());

      const execute = async () => await guard.canActivate(executionContextMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
    });

    it('should throw an UnauthorizedException if user is not a member of the space', async () => {
      membersSpyService.findOneByUserIdAndSpaceId.mockReturnValue(
        (async () => null)(),
      );

      const execute = async () => await guard.canActivate(executionContextMock);

      await expect(execute).rejects.toThrowError(UnauthorizedException);
    });

    it('should return true if the request is validated', async () => {
      const result: boolean = await guard.canActivate(executionContextMock);

      expect(result).toBeTruthy();
    });

    it('should attach space and member owner to request object', async () => {
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
    /*

    it('should attach space and member owner to request object with undefined values', async () => {
      const spaceMock: Space = new Space();
      const memberMock: Member = new Member();
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

    it('should attach space and member owner to request object with manual data', async () => {
      const spaceMock: Space = new Space();
      spaceMock.name = 'aTestName';
      spaceMock.description = 'aTestDescription';
      const memberMock: Member = new Member();
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
    */
  });
});
