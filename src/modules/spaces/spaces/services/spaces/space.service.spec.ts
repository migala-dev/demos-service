import { Test, TestingModule } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';

import { SpaceService } from './space.service';
import { SpaceDto } from '../../dtos/space.dto';
import { SpacesService } from '../../../../../core/database/services/space.service';
import { Space } from '../../../../../core/database/entities/space.entity';
import { MembersService } from '../../../../../core/database/services/member.service';
import { Member } from '../../../../../core/database/entities/member.entity';
import { InvitationStatus, SpaceRole } from '../../../../../core/enums';
import { CreateSpaceResponse } from '../../response/create.response';

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
      newSpaceMock = new SpaceDto();
      userIdMock = 'aUserId';
    });

    it('should create space', async () => {
      await service.create(newSpaceMock, userIdMock);

      expect(spacesSpyService.create).toHaveBeenCalledTimes(1);
      expect(spacesSpyService.create).toHaveBeenCalledWith(
        newSpaceMock,
        userIdMock,
      );
    });

    it('should create space member', async () => {
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

      await service.create(newSpaceMock, userIdMock);

      expect(membersSpyService.create).toHaveBeenCalledTimes(1);
      expect(membersSpyService.create).toHaveBeenCalledWith(
        spaceIdMock,
        userIdMock,
        expectedInvitationStatus,
        expectedSpaceRole,
        userIdMock,
      );
    });

    it('should return an object contains new space and member', async () => {
      const newSpaceMock: Space = new Space();
      const newMemberMock: Member = new Member();
      spacesSpyService.create.mockReturnValue(
        (async () => {
          return newSpaceMock;
        })(),
      );
      membersSpyService.create.mockReturnValue(
        (async () => {
          return newMemberMock;
        })(),
      );
      const expectedResult: CreateSpaceResponse = {
        space: newSpaceMock,
        member: newMemberMock,
      };

      const result: CreateSpaceResponse = await service.create(
        newSpaceMock,
        userIdMock,
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
