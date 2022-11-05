import { Space } from '../../src/core/database/entities/space.entity';
import { Member } from '../../src/core/database/entities/member.entity';
import { User } from '../../src/core/database/entities/user.entity';

export const spaceMockFactory = async (chance: Chance.Chance) => {
  const spaceMock: Space = new Space();
  spaceMock.spaceId = chance.string();
  spaceMock.name = chance.name();
  spaceMock.description = chance.paragraph({ sentences: 1 });
  spaceMock.pictureKey = chance.string();
  spaceMock.approvalPercentage = chance.integer({ min: 51, max: 100 });
  spaceMock.participationPercentage = chance.integer({ min: 51, max: 100 });
  spaceMock.ownerId = chance.string();
  spaceMock.createdAt = chance.date();
  spaceMock.updatedAt = spaceMock.createdAt;

  return spaceMock;
};

export const memberMockFactory = async (chance: Chance.Chance) => {
  const memberMock: Member = new Member();
  memberMock.memberId = chance.string();
  memberMock.spaceId = chance.string();
  memberMock.userId = chance.string();
  memberMock.name = chance.name();
  memberMock.expiredAt = chance.date();
  memberMock.deleted = chance.bool();
  memberMock.createdAt = chance.date();
  memberMock.updatedAt = memberMock.createdAt;
  memberMock.createdBy = chance.string();
  memberMock.updatedBy = memberMock.createdBy;

  return memberMock;
};

export const userMockFactory = async (chance: Chance.Chance) => {
  const userMock: User = new User();
  userMock.userId = chance.string();
  userMock.name = chance.name();
  userMock.phoneNumber = chance.phone({ mobile: true });
  userMock.profilePictureKey = chance.string();
  userMock.cognitoId = chance.string();

  return userMock;
};
