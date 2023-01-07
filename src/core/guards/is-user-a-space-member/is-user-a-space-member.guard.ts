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
import { MemberRepository } from '../../database/services/member.repository';
import { Space } from '../../database/entities/space.entity';
import { SpaceRepository } from '../../database/services/space.repository';
import { SpaceMemberRequest } from '../../interfaces/request.interface';
import { ParamsWithSpaceId } from '../../interfaces/params.interface';
import { RequestWithUser } from '../../interfaces/request.interface';

@Injectable()
export class IsUserASpaceMemberGuard implements CanActivate {
  constructor(
    private readonly membersService: MemberRepository,
    private readonly spacesService: SpaceRepository,
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

    request.space = await this.findSpace(spaceId);
    if (!request.space) throw new BadRequestException('Space not found');

    request.member = await this.findMember(user.userId, spaceId);
    if (!request.member)
      throw new UnauthorizedException('This user is not member of this space');

    return true;
  }

  private async findSpace(spaceId: string): Promise<Space> {
    const space: Space = await this.spacesService.findOneById(spaceId);

    return space;
  }

  private async findMember(userId: string, spaceId: string): Promise<Member> {
    const member: Member = await this.membersService.findOneByUserIdAndSpaceId(
      userId,
      spaceId,
    );

    return member;
  }
}
