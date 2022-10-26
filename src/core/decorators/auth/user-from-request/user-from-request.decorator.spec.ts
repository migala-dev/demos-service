import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { InternalServerErrorException, ExecutionContext } from '@nestjs/common';

import { getParamDecoratorFactory } from '../../../../../test/utils/getParamDecoratorFactory';
import { UserFromRequest } from './user-from-request.decorator';
import { User } from '../../../database/entities/user.entity';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

describe('UserFromRequest decorator', () => {
  const res: object = {};
  let factory;
  let mockUser: User;
  let req: object = { user: mockUser };
  let contextMock: ExecutionContext;

  beforeEach(async () => {
    factory = getParamDecoratorFactory(UserFromRequest);
    mockUser = new User();
    mockUser.userId = '';
    mockUser.name = '';
    mockUser.phoneNumber = '';
    mockUser.profilePictureKey = '';
    mockUser.cognitoId = '';
    mockUser.createdAt = new Date();
    mockUser.updatedAt = new Date();
    req = { user: mockUser };
    contextMock = new ExecutionContextHost([req, res]);
  });

  it('should get request object', () => {
    const httpArgumentsHostMock: HttpArgumentsHost = {
      getRequest: jest.fn().mockReturnValue(req),
      getResponse: null,
      getNext: null,
    };
    jest
      .spyOn(contextMock, 'switchToHttp')
      .mockReturnValue(httpArgumentsHostMock);

    factory(null, contextMock);

    expect(contextMock.switchToHttp).toHaveBeenCalledTimes(1);
    expect(httpArgumentsHostMock.getRequest).toHaveBeenCalledTimes(1);
  });

  it('should throw an InternalServerErrorException if there is no user', () => {
    req = {};
    contextMock = new ExecutionContextHost([req, res]);
    const expectedErrorMessage = 'User not found (request)';

    const execute = () => factory(null, contextMock);

    expect(execute).toThrowError(InternalServerErrorException);
    expect(execute).toThrow(expectedErrorMessage);
  });

  it('should return user if no property name is provided', () => {
    const result: User = factory(null, contextMock);

    expect(result).toStrictEqual(expect.objectContaining(mockUser));
  });

  it('should return property value if a property name is provided', () => {
    const expectedPropertyName = 'userId';
    factory = getParamDecoratorFactory(UserFromRequest);

    const result: string = factory(expectedPropertyName, contextMock);

    expect(result).toBe(mockUser.userId);
  });

  it('should return undefined if property name provided is not valid', () => {
    const expectedPropertyName = 'somePropertyName';
    req = { user: mockUser };
    contextMock = new ExecutionContextHost([req, res]);
    factory = getParamDecoratorFactory(UserFromRequest);

    const result: string = factory(expectedPropertyName, contextMock);

    expect(result).toBeUndefined();
  });
});
