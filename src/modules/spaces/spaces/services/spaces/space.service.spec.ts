import { Test, TestingModule } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';
import { mock } from 'jest-mock-extended';

import { SpaceService } from './space.service';
import { SpacesService } from '../../../../../core/database/services/space.service';
import { Space } from '../../../../../core/database/entities/space.entity';
import { MembersService } from '../../../../../core/database/services/member.service';
import { Member } from '../../../../../core/database/entities/member.entity';
import { InvitationStatus, SpaceRole } from '../../../../../core/enums';
import { CreateSpaceResponse } from '../../response/create.response';
import { SpaceDto } from '../../dtos/space.dto';

describe('SpacesService', () => {
  let service: SpaceService;
  let spacesSpyService: jest.Mocked<SpacesService>;
  let membersSpyService: jest.Mocked<MembersService>;

  beforeEach(async () => {
    spacesSpyService = createSpyObj(SpacesService);
    membersSpyService = createSpyObj(MembersService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpaceService,
        {
          provide: SpacesService,
          useValue: spacesSpyService,
        },
        {
          provide: MembersService,
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
});
