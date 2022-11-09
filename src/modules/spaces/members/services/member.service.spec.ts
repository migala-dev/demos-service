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
  userMockFactory,
} from '../../../../../test/utils/entities-mock.factory';
import { Space } from '../../../../core/database/entities/space.entity';
import { UserToInviteDto } from '../dtos/user-to-invite.dto';
import {
  membersServiceCreateMock,
  usersServiceFindOneByIdMock,
} from '../../../../../test/mocks/send-invitations/send-invitations';

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

    usersSpyService.findOneById.mockReturnValue((async () => ({} as User))());
    usersSpyService.findOneByPhoneNumber.mockReturnValue(
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
    let usersToInviteMock: UserToInviteDto[];

    beforeEach(async () => {
      spaceMock = await spaceMockFactory(chance);
      memberMock = await memberMockFactory(chance);

      membersSpyService.create.mockImplementation(
        membersServiceCreateMock(chance),
      );

      usersSpyService.saveUser.mockReturnValue(
        (async () => {
          const newUser: User = await userMockFactory(chance);

          return newUser;
        })(),
      );
    });

    it('should return invitation if the user to invite only has the phone number', async () => {
      usersToInviteMock = [
        {
          phoneNumber: chance.phone(),
        },
      ];
      const userMock: User = await userMockFactory(chance);
      const expectedResult: Partial<Member> = {
        spaceId: spaceMock.spaceId,
        userId: userMock.userId,
        createdBy: memberMock.userId,
      };
      usersSpyService.findOneByPhoneNumber.mockReturnValue(
        (async () => userMock)(),
      );
      membersSpyService.findOneByUserIdAndSpaceId.mockReturnValue(null);

      const result: Member[] = await service.sendInvitations(
        spaceMock,
        memberMock,
        usersToInviteMock,
      );

      expect(result[0]).toStrictEqual(expect.objectContaining(expectedResult));
    });

    it('should return invitation if the user to invite only has the user id', async () => {
      usersToInviteMock = [
        {
          userId: chance.string(),
        },
      ];
      const expectedResult: Partial<Member> = {
        spaceId: spaceMock.spaceId,
        userId: usersToInviteMock[0].userId,
        createdBy: memberMock.userId,
      };

      const result: Member[] = await service.sendInvitations(
        spaceMock,
        memberMock,
        usersToInviteMock,
      );

      expect(result[0]).toStrictEqual(expect.objectContaining(expectedResult));
    });

    it('should not return invitation if the user to invite has a not valid user id', async () => {
      usersToInviteMock = [
        {
          userId: chance.string(),
        },
      ];
      const expectedLength = 0;
      usersSpyService.findOneById.mockReturnValue((async () => null)());

      const result: Member[] = await service.sendInvitations(
        spaceMock,
        memberMock,
        usersToInviteMock,
      );

      expect(result.length).toBe(expectedLength);
    });

    it('should return one invitation for each user to invite if the user id is valid', async () => {
      usersToInviteMock = [
        {
          userId: chance.string(),
        },
        {
          phoneNumber: chance.phone(),
        },
        {
          userId: chance.string(),
        },
      ];
      const expectedLength = 2;
      const userMock: User = await userMockFactory(chance);
      const expectedInvitations: Partial<Member>[] = usersToInviteMock
        .slice(1)
        .map(({ userId }) => {
          const expectedInvitation: Partial<Member> = {
            spaceId: spaceMock.spaceId,
            userId: userId ? userId : userMock.userId,
            createdBy: memberMock.userId,
          };

          return expectedInvitation;
        });
      usersSpyService.findOneByPhoneNumber.mockReturnValue(
        (async () => userMock)(),
      );
      usersSpyService.findOneById.mockImplementation(
        usersServiceFindOneByIdMock(usersToInviteMock, chance),
      );

      const result: Member[] = await service.sendInvitations(
        spaceMock,
        memberMock,
        usersToInviteMock,
      );

      expect(result.length).toBe(expectedLength);
      expect(result).toEqual(
        expect.arrayContaining(
          expectedInvitations.map((expectedInvitation) =>
            expect.objectContaining(expectedInvitation),
          ),
        ),
      );
    });
  });
});
