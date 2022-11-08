import { Test, TestingModule } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';
import { Chance } from 'chance';

import { MembersService } from '../../../../core/database/services/member.service';
import { UsersService } from '../../../../core/database/services/user.service';
import { MemberService } from './member.service';
import { User } from '../../../../core/database/entities/user.entity';
import { Member } from '../../../../core/database/entities/member.entity';
import {
  spaceMockFactory,
  memberMockFactory,
} from '../../../../../test/utils/entities-mock.factory';
import { Space } from '../../../../core/database/entities/space.entity';
import { UserToInviteModel } from '../../../../../dist/modules/spaces/members/models/user-to-invite.model';

describe('MemberService', () => {
  let service: MemberService;
  let usersSpyService: jest.Mocked<UsersService>;
  let membersSpyService: jest.Mocked<MembersService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    usersSpyService = createSpyObj(UsersService);
    membersSpyService = createSpyObj(MembersService);

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: UsersService,
          useValue: usersSpyService,
        },
        {
          provide: MembersService,
          useValue: membersSpyService,
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);

    usersSpyService.findOneByCognitoId.mockReturnValue(
      (async () => ({} as User))(),
    );
    usersSpyService.saveUser.mockReturnValue((async () => ({} as User))());
    membersSpyService.findOneByUserIdAndSpaceId.mockReturnValue(
      (async () => null)(),
    );
    membersSpyService.create.mockReturnValue((async () => ({} as Member))());
  });

  describe('sendInvitations method', () => {
    let spaceMock: Space;
    let memberMock: Member;
    let usersToInviteMock: UserToInviteModel[];

    beforeEach(async () => {
      spaceMock = await spaceMockFactory(chance);
      memberMock = await memberMockFactory(chance);
      usersToInviteMock = [
        {
          phoneNumber: chance.phone({ mobile: true }),
        },
        {
          userId: chance.string(),
        },
        {
          phoneNumber: chance.phone({ mobile: true }),
          userId: chance.string(),
        },
      ];
    });

    it('should create and return one invitation for each user to invite', async () => {
      const expectedInvitations = usersToInviteMock.map(({ userId }) => {
        const expectedInvitation = {
          spaceId: spaceMock.spaceId,
          createdBy: memberMock.userId,
          userId: userId ? userId : undefined,
        };

        return expectedInvitation;
      });
      membersSpyService.create.mockImplementation(
        async (_: string, userId: string) => {
          const invitationCreated: Member = await memberMockFactory(chance);
          invitationCreated.spaceId = spaceMock.spaceId;
          invitationCreated.createdBy = memberMock.userId;
          invitationCreated.userId = userId;

          return invitationCreated;
        },
      );

      const result: Member[] = await service.sendInvitations(
        spaceMock,
        memberMock,
        usersToInviteMock,
      );

      expect(result.length).toBe(usersToInviteMock.length);
      expect(result).toStrictEqual(
        expect.arrayContaining(
          expectedInvitations.map((expectedInvitation) =>
            expect.objectContaining(expectedInvitation),
          ),
        ),
      );
    });
  });
});
