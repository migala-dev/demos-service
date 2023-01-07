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
import { SpaceRoles } from '../../../core/decorators/space-roles.decorator';
import { SpaceRole } from '../../../core/enums';
import { UpdateSpaceInfoDto } from './dtos/update-space-info.dto';
import { RequestWithSpace } from '../../../core/interfaces/request.interface';
import { UpdateSpaceInfoModel } from './models/update-space-info.model';
import { Space } from '../../../core/database/entities/space.entity';
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

  @Patch(':spaceId')
  @SpaceRoles(SpaceRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  public updateSpaceInfo(
    @Body() updateSpaceInfoDto: UpdateSpaceInfoDto,
    @Req() { user, space }: RequestWithSpace,
  ): Promise<Space> {
    const updateSpaceInfo: UpdateSpaceInfoModel = { ...updateSpaceInfoDto };

    return this.spaceService.updateSpaceInfo(user, space, updateSpaceInfo);
  }
}
