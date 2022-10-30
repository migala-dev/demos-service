import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { Observable } from 'rxjs';

import { Member } from '../../database/entities/member.entity';
import { SpaceRole } from '../../enums';
import { SPACE_ROLES_KEY } from '../../decorators/space-roles.decorator';

@Injectable()
export class SpaceRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const spaceRoles: SpaceRole[] = this.reflector.getAllAndOverride<
      SpaceRole[]
    >(SPACE_ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!spaceRoles) return true;

    const request = context.switchToHttp().getRequest();

    return this.validateRequest(request, spaceRoles);
  }

  private validateRequest(request, spaceRoles: SpaceRole[]): boolean {
    const { member }: { member: Member } = request;
    if (!member) throw new InternalServerErrorException('Member not found');

    return this.validateRoles(member, spaceRoles);
  }

  private validateRoles(member: Member, spaceRoles: SpaceRole[]) {
    const hasSomeRole: boolean = spaceRoles.some((role) =>
      member.role.includes(role),
    );
    if (!hasSomeRole)
      throw new UnauthorizedException(
        'This user does not have the privileges to do the current operation',
      );

    return true;
  }
}
