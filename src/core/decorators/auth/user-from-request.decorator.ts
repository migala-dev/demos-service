import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

import { User } from '../../database/entities/user.entity';

export const UserFromRequest = createParamDecorator(
  (data: string, ctx: ExecutionContext): User | string | Date => {
    const request = ctx.switchToHttp().getRequest();

    const { user }: { user: User } = request;
    if (!user) throw new InternalServerErrorException('User not found (request)');

    return data ? user?.[data] : user;
  }
);