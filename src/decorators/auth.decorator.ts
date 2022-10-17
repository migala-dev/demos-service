import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

import { User } from '../core/database/entities/user.entity';

export const Auth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    try {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    } catch (error) {
      throw new ForbiddenException();
    }
  }
);