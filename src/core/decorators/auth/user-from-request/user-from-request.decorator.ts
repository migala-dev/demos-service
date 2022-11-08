import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { User } from '../../../database/entities/user.entity';

export const UserFromRequest = createParamDecorator(
  (propertyName: string, context: ExecutionContext): User | string | Date => {
    const request = context.switchToHttp().getRequest();

    const { user }: { user: User } = request;
    if (!user)
      throw new InternalServerErrorException('User not found (request)');

    return propertyName ? user?.[propertyName] : user;
  },
);
