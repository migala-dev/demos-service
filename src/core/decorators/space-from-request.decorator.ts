import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { Space } from '../database/entities/space.entity';
import { RequestWithSpace } from '../interfaces/request.interface';

export const SpaceFromRequest = createParamDecorator(
  (
    propertyName: string,
    context: ExecutionContext,
  ): Space | string | number | Date => {
    const request: RequestWithSpace = context.switchToHttp().getRequest();

    const { space }: RequestWithSpace = request;
    if (!space)
      throw new InternalServerErrorException('Space not found (request)');

    return propertyName ? space?.[propertyName] : space;
  },
);
