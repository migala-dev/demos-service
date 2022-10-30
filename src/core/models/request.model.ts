import { User } from '../database/entities/user.entity';
import { Member } from '../database/entities/member.entity';

export interface RequestPlus extends Request {
  params: object;
}

export interface RequestWithUser extends RequestPlus {
  user: User;
}

export interface RequestWithMember extends RequestPlus {
  member: Member;
}