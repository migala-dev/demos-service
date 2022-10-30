import { SetMetadata } from '@nestjs/common';

import { SpaceRole } from '../enums';

export const SPACE_ROLES_KEY: string = 'space-roles';
export const SpaceRoles = (...spaceRoles: SpaceRole[]) => SetMetadata(SPACE_ROLES_KEY, spaceRoles);
