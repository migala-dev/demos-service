import { Member } from '../../../../../core/database/entities/member.entity';
import { Space } from '../../../../../core/database/entities/space.entity';
import { User } from '../../../../../core/database/entities/user.entity';

export class RecoverData {
  spaces: Space[];
  members: Member[];
  users: User[];
  //  proposal: Proposal[];]
  //     proposalParticipations,
  //     proposalVotes,
  //     manifestos,
  //     manifestoOptions,
  //     manifestoComments,
  //     manifestoCommentVotes,
}
