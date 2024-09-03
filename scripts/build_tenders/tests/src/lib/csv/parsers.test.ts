import {
  parseTenderColumn,
  parseTenderCostsColumn,
  parseGeokeyColumn,
  parseDeliveryDriverColumn,
} from '../../../../src/lib/csv/parsers';
import { Products } from '../../../../src/utils/enum';

describe('CSV Column Parsers', () => {
  const mockFilePath = 'Geokey_v1.csv';

  describe('parseTenderColumn', () => {
    it('should parse and validate a valid tender column', () => {
      expect(
        parseTenderColumn(
          '2024-07-23T10:26:11.676Z',
          'activationDate',
          mockFilePath
        )
      ).toBe('2024-07-23T10:26:11.676Z');
      expect(parseTenderColumn('100', 'vat', mockFilePath)).toBe(100);
    });

    it('should throw an error for an invalid tender column', () => {
      expect(() =>
        parseTenderColumn('invalid', 'activationDate', mockFilePath)
      ).toThrow('Value invalid is not a valid DateTime UTC string');
    });

    it('should throw an error for an unknown column', () => {
      expect(() =>
        parseTenderColumn('value', 'unknownColumn', mockFilePath)
      ).toThrow(`Invalid column unknownColumn in file ${mockFilePath}`);
    });
  });

  describe('parseTenderCostsColumn', () => {
    it('should parse and validate a valid tender costs column', () => {
      expect(
        parseTenderCostsColumn(Products.PRODUCT_AR, 'product', mockFilePath)
      ).toBe(Products.PRODUCT_AR);
      expect(
        parseTenderCostsColumn('5,67', 'dematerializationCost', mockFilePath)
      ).toBe(5.67);
    });

    it('should throw an error for an invalid tender costs column', () => {
      expect(() =>
        parseTenderCostsColumn('invalid', 'product', mockFilePath)
      ).toThrow('Value invalid not a valid product');
    });

    it('should throw an error for an unknown column', () => {
      expect(() =>
        parseTenderCostsColumn('value', 'unknownColumn', mockFilePath)
      ).toThrow(`Invalid column unknownColumn in file ${mockFilePath}`);
    });
  });

  describe('parseGeokeyColumn', () => {
    it('should parse and validate a valid geokey column', () => {
      expect(
        parseGeokeyColumn(
          '2024-07-23T10:26:11.676Z',
          'activationDate',
          mockFilePath
        )
      ).toBe('2024-07-23T10:26:11.676Z');
      expect(parseGeokeyColumn('true', 'coverFlag', mockFilePath)).toBe(true);
    });

    it('should throw an error for an invalid geokey column', () => {
      expect(() =>
        parseGeokeyColumn('invalid', 'coverFlag', mockFilePath)
      ).toThrow('Value invalid is not a valid boolean (true, false)');
    });

    it('should throw an error for an unknown column', () => {
      expect(() =>
        parseGeokeyColumn('value', 'unknownColumn', mockFilePath)
      ).toThrow(`Invalid column unknownColumn in file ${mockFilePath}`);
    });
  });

  describe('parseDeliveryDriverColumn', () => {
    it('should parse and validate a valid delivery driver column', () => {
      expect(
        parseDeliveryDriverColumn('12345', 'deliveryDriverId', mockFilePath)
      ).toBe('12345');
      expect(
        parseDeliveryDriverColumn('CompanyName', 'businessName', mockFilePath)
      ).toBe('CompanyName');
    });

    it('should throw an error for an invalid delivery driver column', () => {
      expect(() =>
        parseDeliveryDriverColumn('', 'deliveryDriverId', mockFilePath)
      ).toThrow('Value is empty');
    });

    it('should throw an error for an unknown column', () => {
      expect(() =>
        parseDeliveryDriverColumn('value', 'unknownColumn', mockFilePath)
      ).toThrow(`Invalid column unknownColumn in file ${mockFilePath}`);
    });
  });
});
