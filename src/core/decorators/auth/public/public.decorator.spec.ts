import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { Public, IS_PUBLIC_KEY } from './public.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Public decorator', () => {
  let decorator: () => CustomDecorator<string>;
  let constant: string;

  beforeEach(() => {
    decorator = Public;
    constant = IS_PUBLIC_KEY;
  });

  describe('IS_PUBLIC_KEY constant', () => {
    it('should be defined', () => {
      expect(constant).toBeDefined();
    });

    it('should be a string', () => {
      expect(typeof constant).toBe('string');
    });

    it('should be equal to isPublic', () => {
      const expectedValue: string = 'isPublic';

      expect(constant).toBe(expectedValue);
    });
  });

  describe('Public function', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(decorator).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof decorator).toBe('function');
    });

    it('should call SetMetadata function with the IS_PUBLIC_KEY constant and a true bolean as arguments', () => {
      decorator();

      expect(SetMetadata).toHaveBeenCalledTimes(1);
    });
  });
});
