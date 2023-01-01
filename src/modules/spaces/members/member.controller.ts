import { Body, Controller, Post } from '@nestjs/common';

import { SpaceRoles } from '../../../core/decorators/space-roles.decorator';
import { SpaceRole } from '../../../core/enums';
import { UsersToInviteDto } from './dtos/users-to-invite.dto';
import { MemberService } from './services/member.service';
import { SpaceFromRequest } from '../../../core/decorators/space-from-request.decorator';
import { Space } from '../../../core/database/entities/space.entity';
import { MemberFromRequest } from '../../../core/decorators/member-from-request.decorator';
import { Member } from '../../../core/database/entities/member.entity';

@Controller('members/:spaceId')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post('invitation')
  @SpaceRoles(SpaceRole.ADMIN)
  public sendInvitations(
    @Body() { users }: UsersToInviteDto,
    @SpaceFromRequest() space: Space,
    @MemberFromRequest() member: Member,
  ): Promise<Member[]> {
    console.log('Send invitations');
    return this.memberService.sendInvitations(space, member, users);
  }
}
