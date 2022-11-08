import { Module } from '@nestjs/common';

import { SpaceController } from './spaces/space.controller';
import { SpaceService } from './spaces/services/spaces/space.service';
import { MemberController } from './members/member.controller';
import { MemberService } from './members/services/member.service';

@Module({
  controllers: [SpaceController, MemberController],
  providers: [SpaceService, MemberService],
})
export class SpacesModule {}
