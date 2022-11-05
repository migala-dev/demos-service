import { Body, Controller, Post, Req } from '@nestjs/common';

import { SpaceRoles } from '../../../core/decorators/space-roles.decorator';
import { SpaceRole } from '../../../core/enums';
import { UsersToInviteDto } from './dtos/users-to-invite.dto';
import { MemberService } from './services/member.service';
import { Member } from '../../../core/database/entities/member.entity';
import { UserToInviteModel } from './models/user-to-invite.model';
import { SpaceAndMemberRequest } from '../../../core/interfaces/request.interface';

@Controller('members/:spaceId')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post('invitation')
  @SpaceRoles(SpaceRole.ADMIN)
  public sendInvitations(
    @Body() { users }: UsersToInviteDto,
    @Req() { space, member }: SpaceAndMemberRequest,
  ): Promise<Member[]> {
    const usersToInvite: UserToInviteModel[] = users.map(
      (userToInvite) => ({ ...userToInvite } as UserToInviteModel),
    );

    return this.memberService.sendInvitations(space, member, usersToInvite);
  }
}
