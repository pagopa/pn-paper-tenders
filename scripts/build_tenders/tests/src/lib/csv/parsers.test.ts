import {
  parseTenderColumn,
  parseTenderCostsColumn,
  parseGeokeyColumn,
  parseDeliveryDriverColumn,
  parseCapacityColumn,
  parseProvinceColumn,
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

    it('should parse and validate a valid CAP in geokey column', () => {
      expect(parseGeokeyColumn('00118', 'geokey', mockFilePath)).toBe('00118');
      expect(parseGeokeyColumn('20121', 'geokey', mockFilePath)).toBe('20121');
      expect(parseGeokeyColumn(' 00118 ', 'geokey', mockFilePath)).toBe('00118');
      expect(parseGeokeyColumn('89T67', 'geokey', mockFilePath)).toBe('89T67');
      expect(() =>
        parseGeokeyColumn('1234', 'geokey', mockFilePath)
      ).toThrow('Value 1234 must contain exactly 5 digits');
      expect(() =>
        parseGeokeyColumn('123456', 'geokey', mockFilePath)
      ).toThrow('Value 123456 must contain exactly 5 digits');
    });

    it('should parse and validate a valid province code in geokey column', () => {
      expect(parseGeokeyColumn('RM', 'geokey', mockFilePath)).toBe('RM');
      expect(parseGeokeyColumn('GRÈCE', 'geokey', mockFilePath)).toBe('GRÈCE');
      expect(parseGeokeyColumn('rm', 'geokey', mockFilePath)).toBe('rm');
    });
  });

   describe('parseProvinceColumn', () => {
    it('should parse and validate a valid province column', () => {
      expect(
        parseProvinceColumn(
          'RM',
          'sigla_provincia',
          mockFilePath
        )
      ).toBe('RM');
      expect(parseProvinceColumn('Lazio', 'regione', mockFilePath)).toBe('Lazio');
    });

    it('should throw an error for an invalid province column', () => {
      expect(() =>
        parseProvinceColumn('', 'sigla_provincia', mockFilePath)
      ).toThrow('Value is empty');
    });
    it('should throw an error for an invalid region column', () => {
      expect(() =>
        parseProvinceColumn('', 'regione', mockFilePath)
      ).toThrow('Value is empty');
    });

    it('should throw an error for an unknown column', () => {
      expect(() =>
        parseProvinceColumn('value', 'unknownColumn', mockFilePath)
      ).toThrow(`Invalid column unknownColumn in file ${mockFilePath}`);
    });
  });


  describe('parseCapacityColumn', () => {
    const capacityV1FilePath = 'Capacity_v1.csv';
    const capacityV2FilePath = 'Capacity_v1.csv';
      it('should parse and validate a valid capacity column', () => {
        expect( parseCapacityColumn('2025-03-01T00:00:00.000Z','activationDateFrom',capacityV1FilePath)).toBe('2025-03-01T00:00:00.000Z');
        expect(parseCapacityColumn('1000', 'capacity', capacityV1FilePath)).toBe(1000);
        expect(parseCapacityColumn('2000', 'peakCapacity', capacityV1FilePath)).toBe(2000);
        expect(parseCapacityColumn('NA', 'geoKey', capacityV1FilePath)).toBe('NA');
        expect(parseCapacityColumn('', 'activationDateTo', capacityV1FilePath)).toBe('');
      });

      it('should throw an error for an invalid capacity column', () => {
        expect(() =>
          expect(parseCapacityColumn('test', 'capacity', capacityV1FilePath)).toThrow('Value invalid is not a valid number'));
      });

      it('should throw an error for an invalid peek capacity column', () => {
        expect(() =>
          expect(parseCapacityColumn('test', 'peakCapacity', capacityV1FilePath)).toThrow('Value invalid is not a valid number'));
      });

      it('should throw an error for an invalid activationDateTo in first version', () => {
        expect(() =>
          expect(parseCapacityColumn('2025-03-01T00:00:00Z', 'activationDateTo', capacityV1FilePath)).toThrow('You cannot give a value for Column activationDateTo in version 1for file Capacity_v1.csv'));
      });

      it('should throw an error for an invalid activationDateTo in second version', () => {
        expect(() =>
          expect(parseCapacityColumn('', 'activationDateTo', capacityV2FilePath)).toThrow('Column activationDateTo is mandatory in version 2 for file Capacity_v2.csv'));
      });

      it('should throw an error for an invalid activationDateFrom in second version', () => {
        expect(() =>
          expect(parseCapacityColumn('', 'activationDateFrom', capacityV2FilePath)).toThrow('Column activationDateFrom is mandatory in version 2 for file Capacity_v2.csv'));
      });

      it('should throw an error for an unknown column', () => {
        expect(() =>
          parseCapacityColumn('value', 'unknownColumn', capacityV1FilePath)
        ).toThrow(`Invalid column unknownColumn in file ${capacityV1FilePath}`);
      });

      it('should parse and validate a valid CAP in geoKey column', () => {
        expect(parseCapacityColumn('00118', 'geoKey', capacityV1FilePath)).toBe('00118');
        expect(parseCapacityColumn('20121', 'geoKey', capacityV1FilePath)).toBe('20121');
        expect(parseCapacityColumn(' 00118 ', 'geoKey', capacityV1FilePath)).toBe('00118');
        expect(parseCapacityColumn('89T67', 'geoKey', capacityV1FilePath)).toBe('89T67');
        expect(() =>
          parseCapacityColumn('1234', 'geoKey', capacityV1FilePath)
        ).toThrow('Value 1234 must contain exactly 5 digits');

        expect(() =>
          parseCapacityColumn('123456', 'geoKey', capacityV1FilePath)
        ).toThrow('Value 123456 must contain exactly 5 digits');
      });

      it('should parse and validate a valid province in geoKey column', () => {
        expect(parseCapacityColumn('rm', 'geoKey', capacityV1FilePath)).toBe('rm');
        expect(parseCapacityColumn('GRÈCE', 'geoKey', capacityV1FilePath)).toBe('GRÈCE');
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

      expect(() =>
        parseDeliveryDriverColumn('', 'unifiedDeliveryDriver', mockFilePath)
      ).toThrow('Value is empty');
    });

    it('should throw an error for an unknown column', () => {
      expect(() =>
        parseDeliveryDriverColumn('value', 'unknownColumn', mockFilePath)
      ).toThrow(`Invalid column unknownColumn in file ${mockFilePath}`);
    });
  });
});
