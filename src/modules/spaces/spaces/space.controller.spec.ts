import { Test, TestingModule } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';
import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { SpaceController } from './space.controller';
import { User } from '../../../core/database/entities/user.entity';
import { SpaceService } from './services/spaces/space.service';
import { SpaceDto } from './dtos/space.dto';
import { SpaceModel } from './models/space.model';
import { CreateSpaceResponse } from './response/create.response';
import { Space } from '../../../core/database/entities/space.entity';
import { Member } from '../../../core/database/entities/member.entity';
import { UpdateSpaceInfoDto } from './dtos/update-space-info.dto';
import { SpaceMemberGuard } from '../../../core/guards/space-member/space-member.guard';
import { SpaceRolesGuard } from '../../../core/guards/space-roles/space-roles.guard';
import { RequestWithSpace } from '../../../core/interfaces/request.interface';
import {
  userMockFactory,
  spaceMockFactory,
} from '../../../../test/utils/entities-mock.factory';
import { UpdateSpaceInfoModel } from './models/update-space-info.model';

describe('SpacesController', () => {
  let controller: SpaceController;
  let spaceSpyService: jest.Mocked<SpaceService>;
  let spaceMemberSpyGuard: jest.Mocked<SpaceMemberGuard>;
  let spaceRolesSpyGuard: jest.Mocked<SpaceRolesGuard>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    spaceSpyService = createSpyObj(SpaceService);
    spaceMemberSpyGuard = createSpyObj(SpaceMemberGuard);
    spaceRolesSpyGuard = createSpyObj(SpaceRolesGuard);

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpaceController],
      providers: [
        SpaceService,
        {
          provide: SpaceService,
          useValue: spaceSpyService,
        },
      ],
    })
      .overrideGuard(SpaceMemberGuard)
      .useValue(spaceMemberSpyGuard)
      .overrideGuard(SpaceRolesGuard)
      .useValue(spaceRolesSpyGuard)
      .compile();

    controller = module.get<SpaceController>(SpaceController);

    spaceSpyService.createSpaceAndOwnerMember.mockReturnValue(
      (async () => ({} as CreateSpaceResponse))(),
    );
  });

  describe('create method', () => {
    let spaceDtoMock: SpaceDto;
    let userMock: User;

    beforeEach(() => {
      spaceDtoMock = new SpaceDto();
      userMock = new User();
    });

    it('should create a new space', async () => {
      userMock.userId = '';
      const expectedNewSpace: SpaceModel = { ...spaceDtoMock };

      await controller.create(spaceDtoMock, userMock);

      expect(spaceSpyService.createSpaceAndOwnerMember).toHaveBeenCalledTimes(
        1,
      );
      expect(spaceSpyService.createSpaceAndOwnerMember).toHaveBeenCalledWith(
        expectedNewSpace,
        userMock.userId,
      );
    });

    it('should return an object with the new space and owner member', async () => {
      const createSpaceResponseMock: CreateSpaceResponse = {
        space: new Space(),
        member: new Member(),
      };
      spaceSpyService.createSpaceAndOwnerMember.mockReturnValue(
        (async () => {
          return createSpaceResponseMock;
        })(),
      );

      const result: CreateSpaceResponse = await controller.create(
        spaceDtoMock,
        userMock,
      );

      expect(result.space).toStrictEqual(
        expect.objectContaining(createSpaceResponseMock.space),
      );
      expect(result.member).toStrictEqual(
        expect.objectContaining(createSpaceResponseMock.member),
      );
    });
  });

  describe('updateSpaceInfo method', () => {
    let bodyMock: UpdateSpaceInfoDto;
    let userMock: User;
    let spaceMock: Space;
    let requestMock: RequestWithSpace;

    beforeEach(async () => {
      bodyMock = {
        name: chance.name(),
        description: chance.paragraph({ sentences: 1 }),
        approvalPercentage: chance.integer({ min: 51, max: 100 }),
        participationPercentage: chance.integer({ min: 51, max: 100 }),
      };
      userMock = await userMockFactory(chance);
      spaceMock = await spaceMockFactory(chance);
      requestMock = mock<RequestWithSpace>();
      requestMock.user = userMock;
      requestMock.space = spaceMock;

      spaceSpyService.updateSpaceInfo.mockReturnValue(
        (async () => ({} as Space))(),
      );
    });

    it('should update space info', async () => {
      const expectedUpdateSpaceInfo: UpdateSpaceInfoModel = {
        ...bodyMock,
      };

      await controller.updateSpaceInfo(bodyMock, requestMock);

      expect(spaceSpyService.updateSpaceInfo).toBeCalledTimes(1);
      expect(spaceSpyService.updateSpaceInfo).toBeCalledWith(
        userMock,
        spaceMock,
        expectedUpdateSpaceInfo,
      );
    });

    it('should return updated space', async () => {
      const updatedSpaceMock: Space = await spaceMockFactory(chance);
      updatedSpaceMock.name = bodyMock.name;
      updatedSpaceMock.description = bodyMock.description;
      updatedSpaceMock.approvalPercentage = bodyMock.approvalPercentage;
      updatedSpaceMock.participationPercentage =
        bodyMock.participationPercentage;
      const expectedUpdatedSpace: Space = new Space();
      expectedUpdatedSpace.name = updatedSpaceMock.name;
      expectedUpdatedSpace.description = updatedSpaceMock.description;
      expectedUpdatedSpace.approvalPercentage =
        updatedSpaceMock.approvalPercentage;
      expectedUpdatedSpace.participationPercentage =
        updatedSpaceMock.participationPercentage;
      spaceSpyService.updateSpaceInfo.mockReturnValue(
        (async () => updatedSpaceMock)(),
      );

      const result = await controller.updateSpaceInfo(bodyMock, requestMock);

      expect(result).toStrictEqual(
        expect.objectContaining(expectedUpdatedSpace),
      );
    });
  });
});
