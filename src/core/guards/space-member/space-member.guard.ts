import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import {
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

import { Member } from '../../database/entities/member.entity';
import { MembersService } from '../../database/services/member.service';
import { Space } from '../../database/entities/space.entity';
import { SpacesService } from '../../database/services/space.service';
import { SpaceMemberRequest } from '../../interfaces/request.interface';
import { ParamsWithSpaceId } from '../../interfaces/params.interface';
import { RequestWithUser } from '../../../../dist/core/interfaces/request.interface';

@Injectable()
export class SpaceMemberGuard implements CanActivate {
  constructor(
    private readonly membersService: MembersService,
    private readonly spacesService: SpacesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: SpaceMemberRequest<ParamsWithSpaceId> = context
      .switchToHttp()
      .getRequest();

    return await this.validateRequest(request);
  }

  private async validateRequest(
    request: SpaceMemberRequest<ParamsWithSpaceId>,
  ): Promise<boolean> {
    const { spaceId } = request.params;

    const { user }: RequestWithUser = request;
    if (!user) throw new InternalServerErrorException('User not found');

    request.space = await this.getSpaceAndValidate(spaceId);

    request.member = await this.getMemberAndValidate(user.userId, spaceId);

    return true;
  }

  private async getSpaceAndValidate(spaceId: string): Promise<Space> {
    const space: Space = await this.spacesService.findOneById(spaceId);
    if (!space) throw new BadRequestException('Space not found');

    return space;
  }

  private async getMemberAndValidate(
    userId: string,
    spaceId: string,
  ): Promise<Member> {
    const member: Member = await this.membersService.findOneByUserIdAndSpaceId(
      userId,
      spaceId,
    );
    if (!member)
      throw new UnauthorizedException('This user is not member of this space');

    return member;
  }
}
