import { Test, TestingModule } from '@nestjs/testing';

import { createSpyObj } from 'jest-createspyobj';
import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { MemberController } from './member.controller';
import { MemberService } from './services/member.service';
import { Member } from '../../../core/database/entities/member.entity';
import { UsersToInviteDto } from './dtos/users-to-invite.dto';
import { SpaceAndMemberRequest } from '../../../core/interfaces/request.interface';
import { Space } from '../../../core/database/entities/space.entity';
import {
  spaceMockFactory,
  memberMockFactory,
} from '../../../../test/utils/entities-mock.factory';
import { UserToInviteModel } from '../../../../dist/modules/spaces/members/models/user-to-invite.model';
import { SpaceRolesGuard } from '../../../core/guards/space-roles/space-roles.guard';
import { SpaceMemberGuard } from '../../../core/guards/space-member/space-member.guard';
import { UserToInviteDto } from './dtos/user-to-invite.dto';

describe('MemberController', () => {
  let controller: MemberController;
  let memberSpyService: jest.Mocked<MemberService>;
  let spaceMemberSpyGuard: jest.Mocked<SpaceMemberGuard>;
  let spaceRolesSpyGuard: jest.Mocked<SpaceRolesGuard>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    memberSpyService = createSpyObj(MemberService);
    spaceMemberSpyGuard = createSpyObj(SpaceMemberGuard);
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
      .overrideGuard(SpaceMemberGuard)
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
    let requestMock: SpaceAndMemberRequest;

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
      requestMock = mock<SpaceAndMemberRequest>();
      requestMock.space = spaceMock;
      requestMock.member = memberMock;
    });

    it('should send invitations', async () => {
      const expectedUsers: UserToInviteModel[] = bodyMock.users.map(
        (userToInvite) => ({ ...userToInvite } as UserToInviteModel),
      );

      await controller.sendInvitations(bodyMock, requestMock);

      expect(memberSpyService.sendInvitations).toHaveBeenCalledTimes(1);
      expect(memberSpyService.sendInvitations).toHaveBeenCalledWith(
        spaceMock,
        memberMock,
        expectedUsers,
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
        requestMock,
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
