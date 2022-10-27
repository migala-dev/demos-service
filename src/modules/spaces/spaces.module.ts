import { Module } from '@nestjs/common';

import { SpaceController } from './spaces/space.controller';
import { SpaceService } from './spaces/services/spaces/space.service';

@Module({
  controllers: [SpaceController],
  providers: [SpaceService],
})
export class SpacesModule {}
