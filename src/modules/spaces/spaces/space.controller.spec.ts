import { Test, TestingModule } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';

import { SpaceController } from './space.controller';
import { User } from '../../../core/database/entities/user.entity';
import { SpaceService } from './services/spaces/space.service';
import { SpaceDto } from './dtos/space.dto';
import { CreateSpaceResponse } from './response/create.response';
import { Space } from '../../../core/database/entities/space.entity';
import { Member } from '../../../core/database/entities/member.entity';

describe('SpacesController', () => {
  let controller: SpaceController;
  let spaceSpyService: jest.Mocked<SpaceService>;

  beforeEach(async () => {
    spaceSpyService = createSpyObj(SpaceService);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpaceController],
      providers: [
        SpaceService,
        {
          provide: SpaceService,
          useValue: spaceSpyService,
        },
      ],
    }).compile();

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

      await controller.create(userMock, spaceDtoMock);

      expect(spaceSpyService.createSpaceAndOwnerMember).toHaveBeenCalledTimes(
        1,
      );
      expect(spaceSpyService.createSpaceAndOwnerMember).toHaveBeenCalledWith(
        userMock.userId,
        spaceDtoMock.name,
        spaceDtoMock.description,
        spaceDtoMock.approvalPercentage,
        spaceDtoMock.participationPercentage,
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
        userMock,
        spaceDtoMock,
      );

      expect(result.space).toStrictEqual(
        expect.objectContaining(createSpaceResponseMock.space),
      );
      expect(result.member).toStrictEqual(
        expect.objectContaining(createSpaceResponseMock.member),
      );
    });
  });
});
