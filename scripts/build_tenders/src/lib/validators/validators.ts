import {
  BooleanValidator,
  NumberValidator,
  StringValidator,
} from '../../types/validators-types';
import { Products, Zone } from '../../utils/enum';


/**
 * Checks if the provided string is a valid UTC DateTime string.
 *
 * @param {string} value - The string to validate.
 * @returns {boolean} `true` if the value is a valid UTC DateTime string; 
 * otherwise `false`.
 */
const isValidUtcString = (value: string): boolean => {
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.toISOString() === value;
};

/**
 * Cleans the string by replacing all periods with underscores and 
 * all commas with periods.
 *
 * @param {string} value - The string to clean.
 * @returns {string} The cleaned string.
 */
const cleanString = (value: string): string => {
  return value.replaceAll('.', '_').replaceAll(',', '.');
};

/**
 * Validates if the given string represents a boolean value.
 *
 * @param {string} value - The string to validate.
 * @returns {boolean} The boolean value.
 * @throws {Error} If the value is not 'true' or 'false'.
 */
export const booleanValidator: BooleanValidator = (value: string): boolean => {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  throw new Error(`Value ${value} is not a valid boolean (true, false)`);
};

/**
 * Validates if the given string is defined and non-empty string.
 *
 * @param {string} value - The string to validate.
 * @returns {string} The non-empty string.
 * @throws {Error} If the value is null, undefined, or an empty string.
 */
export const nonEmptyStringValidator: StringValidator = (
  value: string
): string => {
  if (value != null && value.trim() !== '') {
    return value;
  }
  throw new Error(`Value is empty`);
};

/**
 * Returns the provided string as is.
 *
 * @param {string} value - The string to return.
 * @returns {string} The provided string.
 */
export const stringValidator: StringValidator = (value: string): string =>
  value;

/**
 * Validates if the given string is a valid UTC DateTime string.
 *
 * @param {string} value - The string to validate.
 * @returns {string} The valid UTC DateTime string.
 * @throws {Error} If the value is not a valid UTC DateTime string.
 */
export const dateTimeUtcStringValidator: StringValidator = (
  value: string
): string => {
  if (isValidUtcString(value)) return value;
  throw new Error(
    `Value ${value} is not a valid DateTime UTC string (Ex. 2024-07-23T10:26:11.676Z)`
  );
};

export const dateTimeUtcStringValidatorIfPresent: StringValidator = (
  value: string
): string => {
  if(!value) return value;
  if (isValidUtcString(value)) return value;
  throw new Error(
    `Value ${value} is not a valid DateTime UTC string (Ex. 2024-07-23T10:26:11.676Z)`
  );
};

/**
 * Validates if the given string represents a valid integer.
 *
 * @param {string} value - The string to validate.
 * @returns {number} The integer value.
 * @throws {Error} If the value is not a valid integer.
 */
export const integerValidator: NumberValidator = (value: string): number => {
  const number = Number(value);
  if (Number.isInteger(number) && value.trim() !== '') {
    return number;
  }
  throw new Error(`Value ${value} is not a valid integer.`);
};

/**
 * Validates if the given string represents a valid float number.
 *
 * @param {string} value - The string to validate.
 * @returns {number} The float value.
 * @throws {Error} If the value is not a valid float number.
 */
export const floatValidator: NumberValidator = (value: string): number => {
  const cleanedValue = cleanString(value);
  const number = Number(cleanedValue);
  if (!isNaN(number) && cleanedValue.trim() !== '') {
    return number;
  }
  throw new Error(`Value ${value} is not a valid float. (Ex. 23,45)`);
};

/**
 * Validates if the given string is a valid product as defined in the 
 * `Products` enum.
 *
 * @param {string} value - The string to validate.
 * @returns {string} The valid product string.
 * @throws {Error} If the value is not a valid product.
 */
export const productValidator: StringValidator = (value: string): string => {
  if (Object.values(Products).includes(value as Products)) {
    return value;
  }
  throw new Error(
    `Value ${value} not a valid product (${Object.values(Products)})`
  );
};

/**
 * Validates if the given string is a valid zone as defined in the 
 * `Zone` enum.
 *
 * @param {string} value - The string to validate.
 * @returns {string} The valid zone string.
 * @throws {Error} If the value is not a valid zone.
 */
export const zoneValidator: StringValidator = (value: string): string => {
  if (Object.values(Zone).includes(value as Zone)) {
    return value;
  }
  throw new Error(`Value ${value} not a valid zone (${Object.values(Zone)})`);
};

/**
 * Validates if the given string is a valid Italian postal code (CAP) or
 * a province code.
 * A valid CAP must contain exactly 5 digits.
 * A valid province code must contain only letters.
 *
 * @param {string} value - The string to validate.
 * @returns {string} The valid CAP or province code string.
 * @throws {Error} If the value is neither a valid CAP nor a valid province code.
 */
export const geoKeyValidator: StringValidator = (value: string): string => {
  const trimmedValue = value.trim();

  // Check if it's a valid province code (only letters, any length)
  if (/^[\p{L}]+$/u.test(trimmedValue)) {
    return trimmedValue;
  }

  // Check if it's a valid CAP (5 digits)
  if (/^\d{5}$/.test(trimmedValue)) {
      return trimmedValue;
  }

  throw new Error(
    `Value ${value} is not a valid CAP (5 digits) or province code`
  );
};