import { Test, TestingModule } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';
import { Chance } from 'chance';

import { MemberController } from './member.controller';
import { MemberService } from './services/member.service';
import { Member } from '../../../core/database/entities/member.entity';
import { UsersToInviteDto } from './dtos/users-to-invite.dto';
import { UserToInviteDto } from './dtos/user-to-invite.dto';
import { Space } from '../../../core/database/entities/space.entity';
import {
  spaceMockFactory,
  memberMockFactory,
} from '../../../../test/utils/entities-mock.factory';
import { SpaceRolesGuard } from '../../../core/guards/space-roles/space-roles.guard';
import { IsUserASpaceMemberGuard } from '../../../core/guards/is-user-a-space-member/is-user-a-space-member.guard';

describe('MemberController', () => {
  let controller: MemberController;
  let memberSpyService: jest.Mocked<MemberService>;
  let spaceMemberSpyGuard: jest.Mocked<IsUserASpaceMemberGuard>;
  let spaceRolesSpyGuard: jest.Mocked<SpaceRolesGuard>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    memberSpyService = createSpyObj(MemberService);
    spaceMemberSpyGuard = createSpyObj(IsUserASpaceMemberGuard);
    spaceRolesSpyGuard = createSpyObj(SpaceRolesGuard);

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        {
          provide: MemberService,
          useValue: memberSpyService,
        },
      ],
    })
      .overrideGuard(IsUserASpaceMemberGuard)
      .useValue(spaceMemberSpyGuard)
      .overrideGuard(SpaceRolesGuard)
      .useValue(spaceRolesSpyGuard)
      .compile();

    controller = module.get<MemberController>(MemberController);

    memberSpyService.sendInvitations.mockReturnValue(
      (async () => [] as Member[])(),
    );
    spaceMemberSpyGuard.canActivate.mockReturnValue((async () => true)());
    spaceRolesSpyGuard.canActivate.mockReturnValue(true);
  });

  describe('sendInvitations method', () => {
    let spaceMock: Space;
    let memberMock: Member;
    let usersToInviteMock: UserToInviteDto[];
    let bodyMock: UsersToInviteDto;

    beforeEach(async () => {
      [spaceMock, memberMock] = await Promise.all([
        spaceMockFactory(chance),
        memberMockFactory(chance),
      ]);
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
      bodyMock = {
        users: usersToInviteMock,
      };
    });

    it('should send invitations', async () => {
      await controller.sendInvitations(bodyMock, spaceMock, memberMock);

      expect(memberSpyService.sendInvitations).toHaveBeenCalledTimes(1);
      expect(memberSpyService.sendInvitations).toHaveBeenCalledWith(
        spaceMock,
        memberMock,
        bodyMock.users,
      );
    });

    it('should return invitations created', async () => {
      const invitationsCreatedMock: Member[] = await Promise.all(
        usersToInviteMock.map(async ({ userId }) => {
          const invitationCreated: Member = await memberMockFactory(chance);
          invitationCreated.userId = userId ? userId : invitationCreated.userId;

          return invitationCreated;
        }),
      );
      const expectedInvitations: Member[] = invitationsCreatedMock.map(
        (invitation) => invitation,
      );
      memberSpyService.sendInvitations.mockReturnValue(
        (async () => invitationsCreatedMock)(),
      );

      const result: Member[] = await controller.sendInvitations(
        bodyMock,
        spaceMock,
        memberMock,
      );

      expect(result.length).toBe(usersToInviteMock.length);
      expect(result).toStrictEqual(
        expect.arrayContaining(
          expectedInvitations.map((invitation) =>
            expect.objectContaining(invitation),
          ),
        ),
      );
    });
  });
});
