import { applyDecorators, UseGuards } from '@nestjs/common';
import { IsUserASpaceMemberGuard } from '../guards/is-user-a-space-member/is-user-a-space-member.guard';

export const IsUserASpaceMember = () =>
  applyDecorators(UseGuards(IsUserASpaceMemberGuard));
