import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { SpaceRole } from '../enums';
import { SpaceMemberGuard } from '../guards/space-member/space-member.guard';
import { SpaceRolesGuard } from '../guards/space-roles/space-roles.guard';

export const SPACE_ROLES_KEY = 'space-roles';
export const SpaceRoles = (...spaceRoles: SpaceRole[]) =>
  applyDecorators(
    SetMetadata(SPACE_ROLES_KEY, spaceRoles),
    UseGuards(SpaceMemberGuard, SpaceRolesGuard),
  );
