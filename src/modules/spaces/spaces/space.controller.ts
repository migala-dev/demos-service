import { Body, Controller, HttpCode, Post, HttpStatus } from '@nestjs/common';

import { SpaceService } from './services/spaces/space.service';
import { SpaceDto } from './dtos/space.dto';
import { CreateSpaceResponse } from './response/create.response';
import { UserFromRequest } from '../../../core/decorators/auth/user-from-request/user-from-request.decorator';
import { User } from '../../../core/database/entities/user.entity';

@Controller('spaces')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @UserFromRequest() { userId }: User,
    @Body() spaceDto: SpaceDto,
  ): Promise<CreateSpaceResponse> {
    return this.spaceService.createSpaceAndOwnerMember(
      userId,
      spaceDto.name,
      spaceDto.description,
      spaceDto.approvalPercentage,
      spaceDto.participationPercentage,
    );
  }
}
