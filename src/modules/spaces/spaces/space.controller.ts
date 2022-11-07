import {
  Body,
  Controller,
  HttpCode,
  Post,
  HttpStatus,
  Req,
  Patch,
} from '@nestjs/common';

import { SpaceService } from './services/spaces/space.service';
import { SpaceDto } from './dtos/space.dto';
import { CreateSpaceResponse } from './response/create.response';
import { SpaceModel } from './models/space.model';
import { SpaceRoles } from '../../../core/decorators/space-roles.decorator';
import { SpaceRole } from '../../../core/enums';
import { UpdateSpaceInfoDto } from './dtos/update-space-info.dto';
import { RequestWithSpace } from '../../../core/interfaces/request.interface';
import { UpdateSpaceInfoModel } from './models/update-space-info.model';
import { Space } from '../../../core/database/entities/space.entity';
import { User } from '../../../core/database/entities/user.entity';

@Controller('spaces')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() spaceDto: SpaceDto,
  ): Promise<CreateSpaceResponse> {
    const userIdMock = '8a3b0ece-cd25-4c81-ab91-0abacdf9357e';
    const newSpace: SpaceModel = { ...spaceDto };

    return this.spaceService.createSpaceAndOwnerMember(newSpace, userIdMock);
    //return this.spaceService.createSpaceAndOwnerMember(newSpace, userId);
  }

  @Patch(':spaceId')
  @SpaceRoles(SpaceRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  public updateSpaceInfo(
    @Body() updateSpaceInfoDto: UpdateSpaceInfoDto,
    @Req() { user, space }: RequestWithSpace,
  ): Promise<Space> {
    const updateSpaceInfo: UpdateSpaceInfoModel = { ...updateSpaceInfoDto };
    const userMock: User = new User();

    return this.spaceService.updateSpaceInfo(userMock, space, updateSpaceInfo);
    //return this.spaceService.updateSpaceInfo(user, space, updateSpaceInfo);
  }
}
