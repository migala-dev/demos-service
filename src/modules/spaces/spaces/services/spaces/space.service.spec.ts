import { Test, TestingModule } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';
import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { SpaceService } from './space.service';
import { SpaceRepository } from '../../../../../core/database/services/space.repository';
import { Space } from '../../../../../core/database/entities/space.entity';
import { MemberRepository } from '../../../../../core/database/services/member.repository';
import { Member } from '../../../../../core/database/entities/member.entity';
import { InvitationStatus, SpaceRole } from '../../../../../core/enums';
import { CreateSpaceResponse } from '../../response/create.response';
import {
  userMockFactory,
  spaceMockFactory,
} from '../../../../../../test/utils/entities-mock.factory';
import { User } from '../../../../../core/database/entities/user.entity';
import { SpaceDto } from '../../dtos/space.dto';

describe('SpacesService', () => {
  let service: SpaceService;
  let spacesSpyService: jest.Mocked<SpaceRepository>;
  let membersSpyService: jest.Mocked<MemberRepository>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    spacesSpyService = createSpyObj(SpaceRepository);
    membersSpyService = createSpyObj(MemberRepository);

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpaceService,
        {
          provide: SpaceRepository,
          useValue: spacesSpyService,
        },
        {
          provide: MemberRepository,
          useValue: membersSpyService,
        },
      ],
    }).compile();

    service = module.get<SpaceService>(SpaceService);

    spacesSpyService.create.mockReturnValue((async () => ({} as Space))());
    membersSpyService.create.mockReturnValue((async () => ({} as Member))());
  });

  describe('create method', () => {
    let newSpaceMock: SpaceDto;
    let userIdMock: string;

    beforeEach(() => {
      newSpaceMock = mock<SpaceDto>();
      userIdMock = 'aUserId';
    });

    it('should create space', async () => {
      await service.createSpaceAndOwnerMember(
        userIdMock,
        newSpaceMock.name,
        newSpaceMock.description,
        newSpaceMock.approvalPercentage,
        newSpaceMock.participationPercentage,
      );

      expect(spacesSpyService.create).toHaveBeenCalledTimes(1);
      expect(spacesSpyService.create).toHaveBeenCalledWith(
        userIdMock,
        newSpaceMock.name,
        newSpaceMock.description,
        newSpaceMock.approvalPercentage,
        newSpaceMock.participationPercentage,
      );
    });

    it('should create owner member', async () => {
      const spaceIdMock = 'aSpaceId';
      spacesSpyService.create.mockReturnValue(
        (async () => {
          const createdSpaceMock: Space = new Space();
          createdSpaceMock.spaceId = spaceIdMock;

          return createdSpaceMock;
        })(),
      );
      const expectedInvitationStatus: InvitationStatus =
        InvitationStatus.ACCEPTED;
      const expectedSpaceRole: SpaceRole = SpaceRole.ADMIN;

      await service.createSpaceAndOwnerMember(
        userIdMock,
        newSpaceMock.name,
        newSpaceMock.description,
        newSpaceMock.approvalPercentage,
        newSpaceMock.participationPercentage,
      );

      expect(membersSpyService.create).toHaveBeenCalledTimes(1);
      expect(membersSpyService.create).toHaveBeenCalledWith(
        spaceIdMock,
        userIdMock,
        expectedInvitationStatus,
        expectedSpaceRole,
        userIdMock,
      );
    });

    it('should return an object that contains the new space and owner member', async () => {
      const createdNewSpaceMock: Space = new Space();
      const createdNewMemberMock: Member = new Member();
      spacesSpyService.create.mockReturnValue(
        (async () => {
          return createdNewSpaceMock;
        })(),
      );
      membersSpyService.create.mockReturnValue(
        (async () => {
          return createdNewMemberMock;
        })(),
      );
      const expectedResult: CreateSpaceResponse = {
        space: createdNewSpaceMock,
        member: createdNewMemberMock,
      };

      const result: CreateSpaceResponse =
        await service.createSpaceAndOwnerMember(
          userIdMock,
          newSpaceMock.name,
          newSpaceMock.description,
          newSpaceMock.approvalPercentage,
          newSpaceMock.participationPercentage,
        );

      expect(result.space).toStrictEqual(
        expect.objectContaining(expectedResult.space),
      );
      expect(result.member).toStrictEqual(
        expect.objectContaining(expectedResult.member),
      );
    });
  });

  describe('updateSpaceInfo method', () => {
    let userMock: User;
    let spaceMock: Space;
    let spaceInfoMock: SpaceDto;

    beforeEach(async () => {
      userMock = await userMockFactory(chance);
      spaceMock = await spaceMockFactory(chance);
      spaceInfoMock = {
        name: chance.name(),
        description: chance.paragraph({ sentences: 1 }),
        approvalPercentage: chance.integer({ min: 51, max: 100 }),
        participationPercentage: chance.integer({ min: 51, max: 100 }),
      };

      spacesSpyService.findOneById.mockReturnValue(
        (async () => ({} as Space))(),
      );
    });

    it('should update name, description, and percentages of the space', async () => {
      await service.updateSpaceInfo(userMock, spaceMock, spaceInfoMock);

      expect(
        spacesSpyService.updateNameAndDescriptionAndPercentages,
      ).toBeCalledTimes(1);
      expect(
        spacesSpyService.updateNameAndDescriptionAndPercentages,
      ).toBeCalledWith(
        spaceMock.spaceId,
        spaceInfoMock.name,
        spaceInfoMock.description,
        spaceInfoMock.approvalPercentage,
        spaceInfoMock.participationPercentage,
      );
    });

    it('should return the updated space', async () => {
      const updatedSpaceMock: Space = await spaceMockFactory(chance);
      updatedSpaceMock.name = spaceInfoMock.name;
      updatedSpaceMock.description = spaceInfoMock.description;
      updatedSpaceMock.approvalPercentage = updatedSpaceMock.approvalPercentage;
      updatedSpaceMock.participationPercentage =
        updatedSpaceMock.participationPercentage;
      const expectedUpdatedSpace: Space = new Space();
      expectedUpdatedSpace.name = updatedSpaceMock.name;
      expectedUpdatedSpace.description = updatedSpaceMock.description;
      expectedUpdatedSpace.approvalPercentage =
        updatedSpaceMock.approvalPercentage;
      expectedUpdatedSpace.participationPercentage =
        updatedSpaceMock.participationPercentage;
      spacesSpyService.findOneById.mockReturnValue(
        (async () => updatedSpaceMock)(),
      );

      const result: Space = await service.updateSpaceInfo(
        userMock,
        spaceMock,
        spaceInfoMock,
      );

      expect(result).toStrictEqual(
        expect.objectContaining(expectedUpdatedSpace),
      );
    });
  });
});
