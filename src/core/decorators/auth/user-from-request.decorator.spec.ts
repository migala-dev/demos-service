import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { InternalServerErrorException, ExecutionContext } from '@nestjs/common';

import { getParamDecoratorFactory } from '../../../../test/utils/getParamDecoratorFactory';
import { UserFromRequest } from './user-from-request.decorator';
import { User } from '../../database/entities/user.entity';

describe('UserFromRequest decorator', () => {
  const res: object = {};
  let factory;
  let mockUser: User;
  let req: object = { user: mockUser };
  let mockDecoratorData: ExecutionContext;

  beforeEach(async () => {
    factory = getParamDecoratorFactory(false)(UserFromRequest);
    mockUser = new User();
    mockUser.userId = '';
    mockUser.name = '';
    mockUser.phoneNumber = '';
    mockUser.profilePictureKey = '';
    mockUser.cognitoId = '';
    mockUser.createdAt = new Date();
    mockUser.updatedAt = new Date();
    req = { user: mockUser };
    mockDecoratorData = new ExecutionContextHost([req, res]);
  });

  it('should be called with a data of type string and a ctx of type ExecutionContext', () => {
    const data: string = '';
    const objectToSpy = { factory };
    const factorySpy: jest.SpyInstance = jest.spyOn(objectToSpy, 'factory');

    objectToSpy.factory(data, mockDecoratorData);

    expect(factorySpy).toHaveBeenCalled();
    expect(factorySpy).toHaveBeenCalledWith(data, mockDecoratorData);
  });

  it('should return a User instance if no argument is passed', () => {
    const result: User = factory(null, mockDecoratorData);

    expect(result instanceof User).toBeTruthy();
  });

  it('should be call switchToHttp method from ctx', () => {
    const switchToHttpSpyMethod: jest.SpyInstance = jest.spyOn(mockDecoratorData, 'switchToHttp');

    factory(null, mockDecoratorData);

    expect(switchToHttpSpyMethod).toHaveBeenCalled();
  });

  it('should throw an InternalServerErrorException if user is undefined', () => {
    req = {};
    mockDecoratorData = new ExecutionContextHost([req, res]);

    const execute = () => factory(null, mockDecoratorData);

    expect(execute).toThrowError(InternalServerErrorException);
  });

  it('should throw an expected error message if user is undefined', () => {
    req = {};
    mockDecoratorData = new ExecutionContextHost([req, res]);
    const expectedErrorMessage: string = 'User not found (request)';

    const execute = () => factory(null, mockDecoratorData);

    expect(execute).toThrow(expectedErrorMessage);
  });

  it('should return same user instance returned by the getRequest method', () => {
    const result: User = factory(null, mockDecoratorData);

    expect(result).toStrictEqual(
      expect.objectContaining(mockUser)
    );
  });

  it('should return the property specified as argument', () => {
    const expectedPropertyName: string = 'userId';
    factory = getParamDecoratorFactory(true)(UserFromRequest);

    const result: string = factory(expectedPropertyName, mockDecoratorData)

    expect(result).toBe(mockUser.userId);
  });

  it('should return undefined if the property specified as argument is not a User property', () => {
    const expectedPropertyName: string = 'somePropertyName';
    req = { user: mockUser };
    mockDecoratorData = new ExecutionContextHost([req, res]);
    factory = getParamDecoratorFactory(true)(UserFromRequest);

    const result: string = factory(expectedPropertyName, mockDecoratorData)

    expect(result).toBeUndefined();
  });
});
