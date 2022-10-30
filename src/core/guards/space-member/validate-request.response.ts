import { Space } from '../../database/entities/space.entity';
import { Member } from '../../database/entities/member.entity';

export interface ValidateRequestResponse {
  space: Space;
  member: Member;
}
