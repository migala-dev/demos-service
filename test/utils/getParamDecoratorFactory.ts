import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { User } from '../../src/core/database/entities/user.entity';

// eslint-disable-next-line
export const getParamDecoratorFactory = (decorator: Function) => {
  class Test {
    // eslint-disable-next-line
    public test(@decorator() _user: User) {}
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');

  return args[Object.keys(args)[0]].factory;
};
