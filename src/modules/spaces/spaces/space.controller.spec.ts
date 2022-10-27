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

    spaceSpyService.create.mockReturnValue(
      (async () => ({} as CreateSpaceResponse))(),
    );
  });

  describe('create method', () => {
    let newSpaceMock: SpaceDto;
    let userMock: User;

    beforeEach(() => {
      newSpaceMock = new SpaceDto();
      userMock = new User();
    });

    it('should create a new space', async () => {
      const expectedNewSpace: SpaceDto = newSpaceMock;
      const expectedUserId: string = userMock.userId;

      await controller.create(newSpaceMock, userMock);

      expect(spaceSpyService.create).toHaveBeenCalledTimes(1);
      expect(spaceSpyService.create).toHaveBeenCalledWith(
        expectedNewSpace,
        expectedUserId,
      );
    });

    it('should return an object with the new space and member', async () => {
      const createResponseMock: CreateSpaceResponse = {
        space: new Space(),
        member: new Member(),
      };
      spaceSpyService.create.mockReturnValue(
        (async () => {
          return createResponseMock;
        })(),
      );
      const expectedCreateSpaceResponse: CreateSpaceResponse = {
        space: createResponseMock.space,
        member: createResponseMock.member,
      };

      const result: CreateSpaceResponse = await controller.create(
        newSpaceMock,
        userMock,
      );

      expect(result.space).toStrictEqual(
        expect.objectContaining(expectedCreateSpaceResponse.space),
      );
      expect(result.member).toStrictEqual(
        expect.objectContaining(expectedCreateSpaceResponse.member),
      );
    });
  });
});
