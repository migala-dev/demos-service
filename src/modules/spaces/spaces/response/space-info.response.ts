import { Member } from '../../../../core/database/entities/member.entity';
import { Space } from '../../../../core/database/entities/space.entity';
import { User } from '../../../../core/database/entities/user.entity';

export class SpaceInfoResponse {
  space: Space;
  member: Member;
  invitedBy?: User;
}
