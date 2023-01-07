import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { Member } from '../database/entities/member.entity';
import { InvitationStatus, SpaceRole } from '../enums';
import { RequestWithMember } from '../interfaces/request.interface';

export const MemberFromRequest = createParamDecorator(
  (
    propertyName: string,
    context: ExecutionContext,
  ): Member | string | InvitationStatus | SpaceRole | Date | boolean => {
    const request: RequestWithMember = context.switchToHttp().getRequest();

    const { member }: RequestWithMember = request;
    if (!member)
      throw new InternalServerErrorException('Member not found (request)');

    return propertyName ? member?.[propertyName] : member;
  },
);
