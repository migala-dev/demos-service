import { Space } from '../../../../core/database/entities/space.entity';
import { Member } from '../../../../core/database/entities/member.entity';

export interface CreateSpaceResponse {
  space: Space;
  member: Member;
}
