import { Body, Controller, HttpCode, Post, HttpStatus } from '@nestjs/common';

import { User } from '../../../core/database/entities/user.entity';
import { SpaceService } from './services/spaces/space.service';
import { SpaceDto } from './dtos/space.dto';
import { CreateSpaceResponse } from './response/create.response';

@Controller('spaces')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() newSpace: SpaceDto,
  ): Promise<CreateSpaceResponse> {
    const userIdMock = '8a3b0ece-cd25-4c81-ab91-0abacdf9357e';
    return this.spaceService.create(newSpace, userIdMock);
  }
}
