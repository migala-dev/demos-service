import { Body, Controller } from '@nestjs/common';

import { User } from '../../../core/database/entities/user.entity';
import { SpaceService } from './services/spaces/space.service';
import { SpaceDto } from './dtos/space.dto';
import { CreateSpaceResponse } from './response/create.response';

@Controller('spaces')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  public create(
    @Body() newSpace: SpaceDto,
    { userId }: User,
  ): Promise<CreateSpaceResponse> {
    return this.spaceService.create(newSpace, userId);
  }
}
