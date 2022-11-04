import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { UserToInviteDto } from './user-to-invite.dto';

export class UsersToInviteDto {
  @Type(() => UserToInviteDto)
  @ValidateNested({ each: true })
  users: UserToInviteDto[];
}
