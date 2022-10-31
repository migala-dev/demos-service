import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { Member } from 'src/core/database/entities/member.entity';

import { User } from '../../database/entities/user.entity';
import { MembersService } from '../../database/services/member.service';
import { Space } from '../../database/entities/space.entity';
import { SpacesService } from '../../database/services/space.service';
import { UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { SpaceMemberRequest } from '../../interfaces/request.interface';
import { Params } from '../../interfaces/params.interface';

@Injectable()
export class SpaceMemberGuard implements CanActivate {
  constructor(
    private readonly membersService: MembersService,
    private readonly spacesService: SpacesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: SpaceMemberRequest<Params> = context.switchToHttp().getRequest();

    return await this.validateRequest(request);
  }

  private async validateRequest(
    request: SpaceMemberRequest<Params>,
  ): Promise<boolean> {
    const { spaceId } = request.params;
    const spaceIdMock = '63c928ab-d59f-4ac3-b4e3-5d4080302123';

    const { user }: { user: User } = request;
    if (!user) throw new InternalServerErrorException('User not found');

    const userMock: User = new User();
    userMock.userId = '8a3b0ece-cd25-4c81-ab91-0abacdf9357e';

    request.space = await this.getSpace(spaceIdMock);

    request.member = await this.getMember(userMock.userId, spaceIdMock);

    return true;
  }

  private async getSpace(spaceId: string): Promise<Space> {
    const space: Space = await this.spacesService.findOneById(spaceId);
    if (!space) throw new BadRequestException('Space not found');

    return space;
  }

  private async getMember(userId: string, spaceId: string): Promise<Member> {
    const member: Member = await this.membersService.findOneByUserIdAndSpaceId(
      userId,
      spaceId,
    );
    if (!member)
      throw new UnauthorizedException('This user is not member of this space');

    return member;
  }
}
