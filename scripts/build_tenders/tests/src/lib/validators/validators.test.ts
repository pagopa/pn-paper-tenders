import {
  booleanValidator,
  nonEmptyStringValidator,
  stringValidator,
  dateTimeUtcStringValidator,
  dateTimeUtcStringValidatorIfPresent,
  integerValidator,
  floatValidator,
  productValidator,
  zoneValidator,
} from '../../../../src/lib/validators/validators';
import { Products, Zone } from '../../../../src/utils/enum';

describe('Validators', () => {
  describe('booleanValidator', () => {
    it('should return true for "true"', () => {
      expect(booleanValidator('true')).toBe(true);
    });

    it('should return false for "false"', () => {
      expect(booleanValidator('false')).toBe(false);
    });

    it('should throw an error for non-boolean strings', () => {
      expect(() => booleanValidator('yes')).toThrow(
        'Value yes is not a valid boolean (true, false)'
      );
    });
  });

  describe('nonEmptyStringValidator', () => {
    it('should return the string if non-empty', () => {
      expect(nonEmptyStringValidator('hello')).toBe('hello');
    });

    it('should throw an error for empty strings', () => {
      expect(() => nonEmptyStringValidator('')).toThrow('Value is empty');
    });

    it('should throw an error for strings with only spaces', () => {
      expect(() => nonEmptyStringValidator('   ')).toThrow('Value is empty');
    });
  });

  describe('stringValidator', () => {
    it('should return the same string', () => {
      expect(stringValidator('some string')).toBe('some string');
    });
  });

  describe('dateTimeUtcStringValidator', () => {
    it('should return the string if it is a valid UTC DateTime', () => {
      const validUtc = '2024-07-23T10:26:11.676Z';
      expect(dateTimeUtcStringValidator(validUtc)).toBe(validUtc);
    });

    it('should throw an error for invalid UTC DateTime strings', () => {
      const invalidUtc = '2024-07-23T10:26:11';
      expect(() => dateTimeUtcStringValidator(invalidUtc)).toThrow(
        `Value ${invalidUtc} is not a valid DateTime UTC string (Ex. 2024-07-23T10:26:11.676Z)`
      );
    });
  });

   describe('dateTimeUtcStringValidatorIfPresent', () => {
    it('should return empty string if it is empty', () => {
           const value = '';
           expect(dateTimeUtcStringValidatorIfPresent(value)).toBe('');
         });
      it('should return the string if it is a valid UTC DateTime', () => {
        const validUtc = '2024-07-23T10:26:11.676Z';
        expect(dateTimeUtcStringValidator(validUtc)).toBe(validUtc);
      });

      it('should throw an error for invalid UTC DateTime strings', () => {
        const invalidUtc = '2024-07-23T10:26:11';
        expect(() => dateTimeUtcStringValidator(invalidUtc)).toThrow(
          `Value ${invalidUtc} is not a valid DateTime UTC string (Ex. 2024-07-23T10:26:11.676Z)`
        );
      });
    });

  describe('integerValidator', () => {
    it('should return the integer if the string represents a valid integer', () => {
      expect(integerValidator('42')).toBe(42);
    });

    it('should throw an error for non-integer strings', () => {
      expect(() => integerValidator('42.3')).toThrow(
        'Value 42.3 is not a valid integer.'
      );
    });

    it('should throw an error for empty strings', () => {
      expect(() => integerValidator('')).toThrow(
        'Value  is not a valid integer.'
      );
    });
  });

  describe('floatValidator', () => {
    it('should throw an error for float strings with dot', () => {
      expect(() => floatValidator('42.3')).toThrow(
        'Value 42.3 is not a valid float. (Ex. 23,45)'
      );
    });

    it('should handle floats with commas', () => {
      expect(floatValidator('42,3')).toBe(42.3);
    });

    it('should throw an error for non-float strings', () => {
      expect(() => floatValidator('abc')).toThrow(
        'Value abc is not a valid float. (Ex. 23,45)'
      );
    });
  });

  describe('productValidator', () => {
    it('should return the product if it is valid', () => {
      expect(productValidator(Products.PRODUCT_AR)).toBe(Products.PRODUCT_AR);
    });

    it('should throw an error for invalid products', () => {
      expect(() => productValidator('InvalidProduct')).toThrow(
        `Value InvalidProduct not a valid product (${Object.values(Products)})`
      );
    });
  });

  describe('zoneValidator', () => {
    it('should return the zone if it is valid', () => {
      expect(zoneValidator(Zone.ZONE_AM)).toBe(Zone.ZONE_AM);
    });

    it('should throw an error for invalid zones', () => {
      expect(() => zoneValidator('InvalidZone')).toThrow(
        `Value InvalidZone not a valid zone (${Object.values(Zone)})`
      );
    });
  });
});
