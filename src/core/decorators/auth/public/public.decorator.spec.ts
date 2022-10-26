import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { Public, IS_PUBLIC_KEY } from './public.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest
    .fn()
    .mockResolvedValue({ KEY: 'isPublic' } as CustomDecorator<string>),
}));

describe('Public decorator', () => {
  let decorator: () => CustomDecorator<string>;
  let constant: string;

  beforeEach(() => {
    decorator = Public;
    constant = IS_PUBLIC_KEY;
  });

  describe('IS_PUBLIC_KEY constant', () => {
    it('should be equal to isPublic', () => {
      const expectedValue = 'isPublic';

      expect(constant).toBe(expectedValue);
    });
  });

  describe('Public function', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should get decorator with set metadata', () => {
      const expectedKey = 'isPublic';
      const expectedValue = true;

      decorator();

      expect(SetMetadata).toHaveBeenCalledTimes(1);
      expect(SetMetadata).toHaveBeenCalledWith(expectedKey, expectedValue);
    });

    it('should return the decorator', () => {
      const expectedKey = 'isPublic';

      const result: CustomDecorator<string> = decorator();

      expect(expectedKey in result);
    });
  });
});
