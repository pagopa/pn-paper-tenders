import {
  DeliveryDriverValidators,
  GeokeyValidators,
  TenderCostsValidators,
  TenderValidators,
} from '../../types/validators-types';
import {
  geokeyFileVersionPattern,
  rangeColumnPattern,
} from '../../utils/regex';
import {
  booleanValidator,
  dateTimeUtcStringValidator,
  floatValidator,
  integerValidator,
  nonEmptyStringValidator,
  productValidator,
  stringValidator,
  zoneValidator,
} from '../validators/validators';
import { parseColCsvFun } from './reader';

/**
 * A map of validator functions for validating columns in the Tender
 * CSV files.
 */
const tenderValidatorsMap: TenderValidators = {
  activationDate: dateTimeUtcStringValidator,
  tenderName: nonEmptyStringValidator,
  vat: integerValidator,
  nonDeductibleVat: integerValidator,
  fee: floatValidator,
  pagePrice: floatValidator,
  basePriceAR: floatValidator,
  basePriceRS: floatValidator,
  basePrice890: floatValidator,
};

/**
 * A map of validator functions for validating columns in the TenderCosts
 * CSV files.
 */
const tenderCostsValidatorsMap: TenderCostsValidators = {
  product: productValidator,
  lot: nonEmptyStringValidator,
  zone: zoneValidator,
  deliveryDriverName: nonEmptyStringValidator,
  deliveryDriverId: nonEmptyStringValidator,
  dematerializationCost: floatValidator,
  range: floatValidator,
};

/**
 * A map of validator functions for validating columns in the Geokey
 * CSV files.
 */
const geokeyValidatorsMap: GeokeyValidators = {
  activationDate: dateTimeUtcStringValidator,
  geokey: nonEmptyStringValidator,
  product: productValidator,
  lot: nonEmptyStringValidator,
  zone: zoneValidator,
  coverFlag: booleanValidator,
  dismissed: booleanValidator,
};

/**
 * A map of validator functions for validating columns in the DeliveryDriver
 * CSV files.
 */
const deliveryDriverValidatorsMap: DeliveryDriverValidators = {
  deliveryDriverId: nonEmptyStringValidator,
  taxId: nonEmptyStringValidator,
  businessName: stringValidator,
  fiscalCode: nonEmptyStringValidator,
  pec: stringValidator,
  phoneNumber: stringValidator,
  registeredOffice: stringValidator,
};

/**
 * Throws an error if the column is invalid for the given validators map.
 *
 * @param validators - The map of validators for the given CSV type.
 * @param key - The column key to validate.
 * @param filePath - The path to the CSV file being validated.
 * @throws Will throw an error if the column is not valid.
 */
const throwInvalidColumnError = (
  validators: object,
  key: string,
  filePath: string
) => {
  if (!Object.keys(validators).includes(key)) {
    throw new Error(`Invalid column ${key} in file ${filePath}`);
  }
};

/**
 * Parses a column from a Tender CSV file.
 *
 * @param value - The value to be validated and parsed.
 * @param column - The column name of the value.
 * @param filePath - The path to the CSV file being parsed.
 * @returns The parsed and validated value.
 * @throws Will throw an error if the column is invalid or the value
 * fails validation.
 */
export const parseTenderColumn: parseColCsvFun = (
  value: string,
  column: string,
  filePath: string
) => {
  throwInvalidColumnError(tenderValidatorsMap, column, filePath);
  const key = column as keyof TenderValidators;
  return tenderValidatorsMap[key](value);
};

/**
 * Parses a column from a TenderCosts CSV file.
 *
 * @param value - The value to be validated and parsed.
 * @param column - The column name of the value.
 * @param filePath - The path to the CSV file being parsed.
 * @returns The parsed and validated value.
 * @throws Will throw an error if the column is invalid or the value
 * fails validation.
 */
export const parseTenderCostsColumn: parseColCsvFun = (
  value: string,
  column: string,
  filePath: string
) => {
  // range key validation
  if (rangeColumnPattern.test(column)) {
    const match = column.match(rangeColumnPattern);

    const minWeight = parseInt(match![1]!, 10);
    const maxWeight = parseInt(match![2]!, 10);

    if (minWeight >= maxWeight) {
      throw new Error(
        `Invalid column ${column} in file ${filePath}: minWeight must be < maxWeight`
      );
    }
    return tenderCostsValidatorsMap.range(value);
  }
  throwInvalidColumnError(tenderCostsValidatorsMap, column, filePath);
  const key = column as keyof TenderCostsValidators;
  return tenderCostsValidatorsMap[key](value);
};

/**
 * Parses a column from a Geokey CSV file.
 *
 * @param value - The value to be validated and parsed.
 * @param column - The column name of the value.
 * @param filePath - The path to the CSV file being parsed.
 * @returns The parsed and validated value.
 * @throws Will throw an error if the column is invalid or the value
 * fails validation.
 */
export const parseGeokeyColumn: parseColCsvFun = (
  value: string,
  column: string,
  filePath: string
) => {
  throwInvalidColumnError(geokeyValidatorsMap, column, filePath);
  const match = filePath.match(geokeyFileVersionPattern);
  if(!match) {
    throw new Error(`Invalid geokey file name ${filePath}`);
  }
  // Geokey_v1
  if (match[1] === '1' && column === 'activationDate' && value.trim() === '') {
    return '';
  }
  const key = column as keyof GeokeyValidators;
  return geokeyValidatorsMap[key](value);
};

/**
 * Parses a column from a DeliveryDriver CSV file.
 *
 * @param value - The value to be validated and parsed.
 * @param column - The column name of the value.
 * @param filePath - The path to the CSV file being parsed.
 * @returns The parsed and validated value.
 * @throws Will throw an error if the column is invalid or the value
 * fails validation.
 */
export const parseDeliveryDriverColumn: parseColCsvFun = (
  value: string,
  column: string,
  filePath: string
) => {
  throwInvalidColumnError(deliveryDriverValidatorsMap, column, filePath);
  const key = column as keyof DeliveryDriverValidators;
  return deliveryDriverValidatorsMap[key](value);
};
