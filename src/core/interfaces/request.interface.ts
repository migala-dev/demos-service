import { User } from '../database/entities/user.entity';
import { Space } from '../database/entities/space.entity';
import { Member } from '../database/entities/member.entity';

export interface RequestWithUser extends Request {
  user: User;
}

export interface RequestWithParams<T> extends Request {
  params: T;
}

export interface RequestWithSpace extends RequestWithUser {
  space: Space;
}

export interface RequestWithMember extends RequestWithUser {
  member: Member;
}

export interface SpaceMemberRequest<T>
  extends RequestWithParams<T>,
    RequestWithSpace,
    RequestWithMember {}

export interface SpaceAndMemberRequest  extends RequestWithSpace, RequestWithMember {}
