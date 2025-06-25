import * as fs from 'fs';
import { CastingContext, parse } from 'csv-parse/sync';
import { CSV_DELIMITER } from '../../config';
import {
  parseDeliveryDriverColumn,
  parseGeokeyColumn,
  parseTenderColumn,
  parseTenderCostsColumn,
  parseCapacityColumn,
} from './parsers';
import {
  DeliveryDriverCSV,
  GeokeyCSV,
  TenderCSV,
  TenderCostsCSV,
  CapacityCSV,
} from '../../types/csv-types';

export type parseColCsvFun = (
  value: string,
  column: string,
  filePath: string
) => string | number | boolean;

/**
 * Reads a CSV file and parses its content using a provided parsing function.
 *
 * @param filePath - The path to the CSV file.
 * @param parseColFun - The function to parse each column value.
 * @returns The parsed content of the CSV file.
 * @throws Will throw an error if there is an issue parsing a specific value 
 * in the file.
 */
export const readCsv = (
  filePath: string,
  parseColFun: parseColCsvFun
): [] => {
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const config = {
    columns: true,
    skip_empty_lines: false,
    delimiter: CSV_DELIMITER,
    cast: (columnValue: string, context: CastingContext) => {
      // header line
      if (context.lines === 1) return columnValue;
      try {
        return parseColFun(columnValue, context.column as string, filePath);
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(
            `${e.message}\n on file ${filePath} line ${context.lines} column "${context.column}"`
          );
        }
      }
    },
  };
  return parse(fileContent, config);
};


/**
 * Reads and parses a Tender CSV file.
 *
 * @param filePath - The path to the Tender CSV file.
 * @returns An array of parsed `TenderCSV` objects.
 */
export const readTenderCsv = (filePath: string): TenderCSV[] => {
  return readCsv(filePath, parseTenderColumn) as TenderCSV[];
};

/**
 * Reads and parses a TenderCosts CSV file.
 *
 * @param filePath - The path to the TenderCosts CSV file.
 * @returns An array of parsed `TenderCostsCSV` objects.
 */
export const readTenderCostsCsv = (filePath: string): TenderCostsCSV[] => {
  return readCsv(filePath, parseTenderCostsColumn) as TenderCostsCSV[];
};

/**
 * Reads and parses a Geokey CSV file.
 *
 * @param filePath - The path to the Geokey CSV file.
 * @returns An array of parsed `GeokeyCSV` objects.
 */
export const readGeokeyCsv = (filePath: string): GeokeyCSV[] => {
  return readCsv(filePath, parseGeokeyColumn) as GeokeyCSV[];
};

/**
 * Reads and parses a DeliveryDriver CSV file.
 *
 * @param filePath - The path to the DeliveryDriver CSV file.
 * @returns An array of parsed `DeliveryDriverCSV` objects.
 */
export const readDeliveryDriverCsv = (filePath: string): DeliveryDriverCSV[] => {
  return readCsv(filePath, parseDeliveryDriverColumn) as DeliveryDriverCSV[];
};

/**
 * Reads and parses a Capacity CSV file.
 *
 * @param filePath - The path to the Capacity CSV file.
 * @returns An array of parsed `CapacityCSV` objects.
 */
export const readCapacityCsv = (filePath: string): CapacityCSV[] => {
  return readCsv(filePath, parseCapacityColumn) as CapacityCSV[];
};
