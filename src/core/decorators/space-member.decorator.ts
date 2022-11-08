import { applyDecorators, UseGuards } from '@nestjs/common';
import { SpaceMemberGuard } from '../guards/space-member/space-member.guard';

export const SpaceMember = () => applyDecorators(UseGuards(SpaceMemberGuard));
