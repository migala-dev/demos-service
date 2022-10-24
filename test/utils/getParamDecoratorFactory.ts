import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'

import { User } from '../../src/core/database/entities/user.entity';

export function getParamDecoratorFactory(decorator: Function) {
  class Test {
    public test(@decorator() user: User) {}
  }

  const args = Reflect.getMetadata(
    ROUTE_ARGS_METADATA, 
    Test, 
    'test',
  );

  return args[Object.keys(args)[0]].factory;
};