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

  it('should be called with a propertyName of type string and a context of type ExecutionContext', () => {
    const propertyName: string = '';
    const objectToSpy = { factory };
    jest.spyOn(objectToSpy, 'factory');

    objectToSpy.factory(propertyName, contextMock);

    expect(objectToSpy.factory).toHaveBeenCalled();
    expect(objectToSpy.factory).toHaveBeenCalledWith(propertyName, contextMock);
  });

  it('should return a User instance if no argument is passed', () => {
    const result: User = factory(null, contextMock);

    expect(result instanceof User).toBeTruthy();
  });

  it('should be call switchToHttp method from ctx', () => {
    jest.spyOn(contextMock, 'switchToHttp');

    factory(null, contextMock);

    expect(contextMock.switchToHttp).toHaveBeenCalledTimes(1);
  });

  it('should be call getRequest method from the object returned by the switchToHttp method', () => {
    const httpArgumentsHostMock: HttpArgumentsHost = {
      getRequest: jest.fn().mockReturnValue(req),
      getResponse: null,
      getNext: null,
    };
    jest
      .spyOn(contextMock, 'switchToHttp')
      .mockReturnValue(httpArgumentsHostMock);

    factory(null, contextMock);

    expect(httpArgumentsHostMock.getRequest).toHaveBeenCalledTimes(1);
  });

  it('should throw an InternalServerErrorException if user is undefined', () => {
    req = {};
    contextMock = new ExecutionContextHost([req, res]);

    const execute = () => factory(null, contextMock);

    expect(execute).toThrowError(InternalServerErrorException);
  });

  it('should throw an expected error message if user is undefined', () => {
    req = {};
    contextMock = new ExecutionContextHost([req, res]);
    const expectedErrorMessage: string = 'User not found (request)';

    const execute = () => factory(null, contextMock);

    expect(execute).toThrow(expectedErrorMessage);
  });

  it('should return same user instance returned by the getRequest method', () => {
    const result: User = factory(null, contextMock);

    expect(result).toStrictEqual(expect.objectContaining(mockUser));
  });

  it('should return the property specified as argument', () => {
    const expectedPropertyName: string = 'userId';
    factory = getParamDecoratorFactory(UserFromRequest);

    const result: string = factory(expectedPropertyName, contextMock);

    expect(result).toBe(mockUser.userId);
  });

  it('should return undefined if the property specified as argument is not a valid User property', () => {
    const expectedPropertyName: string = 'somePropertyName';
    req = { user: mockUser };
    contextMock = new ExecutionContextHost([req, res]);
    factory = getParamDecoratorFactory(UserFromRequest);

    const result: string = factory(expectedPropertyName, contextMock);

    expect(result).toBeUndefined();
  });
});
