import * as fs from 'fs';
import {
  readCsv,
  readTenderCsv,
  readTenderCostsCsv,
  readGeokeyCsv,
  readDeliveryDriverCsv,
  readCapacityCsv,
  parseColCsvFun,
  readProvinceCsv,
} from '../../../../src/lib/csv/reader';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('CSV Reader Functions', () => {
  const mockFilePath = '/path/to/csv/Geokey_v1.csv';
  const mockFileContent = 'col1;col2\nval1;val2\nval3;val4';

  beforeEach(() => {
    mockedFs.readFileSync.mockClear();
  });

  describe('readCsv', () => {
    it('should parse CSV content correctly using the provided parse function', () => {
      // Arrange
      const mockParseColFun: parseColCsvFun = jest.fn((value) => value);
      mockedFs.readFileSync.mockReturnValue(mockFileContent);

      // Act
      const result = readCsv(mockFilePath, mockParseColFun);

      // Assert
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(mockFilePath, {
        encoding: 'utf-8',
      });
      expect(mockParseColFun).toHaveBeenCalledTimes(4);
      expect(result).toEqual([
        { col1: 'val1', col2: 'val2' },
        { col1: 'val3', col2: 'val4' },
      ]);
    });

    it('should throw an error with detailed information if parsing fails', () => {
      // Arrange
      const mockParseColFun: parseColCsvFun = jest.fn(() => {
        throw new Error('Parsing error');
      });
      mockedFs.readFileSync.mockReturnValue(mockFileContent);

      // Act Assert
      expect(() => readCsv(mockFilePath, mockParseColFun)).toThrow(
        `Parsing error\n on file ${mockFilePath} line 2 column "col1"`
      );
    });
  });

  describe('readTenderCsv', () => {
    it('should parse Tender CSV content correctly', () => {
      // Arrange
      const mockTenderData =
        'activationDate;tenderName;vat;nonDeductibleVat;fee;pagePrice;basePriceAR;basePriceRS;basePrice890\n' +
        '2024-07-23T10:26:11.676Z;20240723;22;35;0,50025;0,12345;0,05945;0,01234;0,09432';
      mockedFs.readFileSync.mockReturnValue(mockTenderData);

      // Act
      const result = readTenderCsv(mockFilePath);

      // Assert
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(mockFilePath, {
        encoding: 'utf-8',
      });
      expect(result).toEqual([
        {
          activationDate: '2024-07-23T10:26:11.676Z',
          tenderName: '20240723',
          vat: 22,
          nonDeductibleVat: 35,
          fee: 0.50025,
          pagePrice: 0.12345,
          basePriceAR: 0.05945,
          basePriceRS: 0.01234,
          basePrice890: 0.09432,
        },
      ]);
    });
  });

  describe('readTenderCostsCsv', () => {
    it('should parse TenderCosts CSV content correctly', () => {
      // Arrange
      const mockTenderCostsData =
        'product;lot;zone;deliveryDriverName;deliveryDriverId;dematerializationCost;' +
        'range_0_20;range_21_50;range_51_100;range_101_250;range_251_350;range_351_1000;range_1001_2000\n' +
        'RS;23;EU;Poste;POSTE;0,09876;0,00123;0,00987;0,01234;0,09876;0,12512;0,43209;0,80123';
      mockedFs.readFileSync.mockReturnValue(mockTenderCostsData);

      // Act
      const result = readTenderCostsCsv(mockFilePath);

      // Assert
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(mockFilePath, {
        encoding: 'utf-8',
      });
      expect(result).toEqual([
        {
          product: 'RS',
          lot: '23',
          zone: 'EU',
          deliveryDriverName: 'Poste',
          deliveryDriverId: 'POSTE',
          dematerializationCost: 0.09876,
          range_0_20: 0.00123,
          range_21_50: 0.00987,
          range_51_100: 0.01234,
          range_101_250: 0.09876,
          range_251_350: 0.12512,
          range_351_1000: 0.43209,
          range_1001_2000: 0.80123,
        },
      ]);
    });
  });

  describe('readGeokeyCsv', () => {
    it('should parse Geokey CSV content correctly', () => {
      // Arrange
      const mockGeokeyData =
        'geokey;product;lot;zone;coverFlag;dismissed\n' +
        '00100;RS;23;EU;true;false';
      mockedFs.readFileSync.mockReturnValue(mockGeokeyData);

      // Act
      const result = readGeokeyCsv(mockFilePath);

      // Assert
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(mockFilePath, {
        encoding: 'utf-8',
      });
      expect(result).toEqual([
        {
          geokey: '00100',
          product: 'RS',
          lot: '23',
          zone: 'EU',
          coverFlag: true,
          dismissed: false,
        },
      ]);
    });
  });

  describe('readCapacityCsv', () => {
     const capacityFilePath = '/path/to/csv/Capacity_v2.csv';
      it('should parse Capacity CSV content correctly', () => {
        // Arrange
        const mockCapacityData =
          'unifiedDeliveryDriver;geoKey;capacity;peakCapacity;activationDateFrom;activationDateTo;products\n' +
          '1;NA;1000;2000;2025-03-01T00:00:00.000Z;2025-04-01T00:00:00.000Z;AR,890';
        mockedFs.readFileSync.mockReturnValue(mockCapacityData);

        // Act
        const result = readCapacityCsv(capacityFilePath);

        // Assert
        expect(mockedFs.readFileSync).toHaveBeenCalledWith(capacityFilePath, {
          encoding: 'utf-8',
        });
        expect(result).toEqual([
          {
            unifiedDeliveryDriver: '1',
            geoKey: 'NA',
            capacity: 1000,
            peakCapacity: 2000,
            activationDateFrom: '2025-03-01T00:00:00.000Z',
            activationDateTo: '2025-04-01T00:00:00.000Z',
            products: 'AR,890',
          },
        ]);
      });
    });

   describe('readProvinceCsv', () => {
     const provincesFilePath = '/path/to/csv/Province.csv';
      it('should parse Province  CSV content correctly', () => {
        // Arrange
        const mockProvinceData =
          'province;region;percentageDistribution\n' +
          'NA;Campania;80';
        mockedFs.readFileSync.mockReturnValue(mockProvinceData);

        // Act
        const result = readProvinceCsv(provincesFilePath);

        // Assert
        expect(mockedFs.readFileSync).toHaveBeenCalledWith(provincesFilePath, {
          encoding: 'utf-8',
        });
        expect(result).toEqual([
          {
            province: 'NA',
            region: 'Campania',
            percentageDistribution: 80
          },
        ]);
      });
    });



  describe('readDeliveryDriverCsv', () => {
    it('should parse DeliveryDriver CSV content correctly', () => {
      // Arrange
      const mockDriverData =
        'deliveryDriverId;taxId;businessName;fiscalCode;pec;phoneNumber;registeredOffice;unifiedDeliveryDriver\n' +
        'POSTE;01114601006;Poste;97103880585;poste@pec.it;+39012-123456;;POSTE';
      mockedFs.readFileSync.mockReturnValue(mockDriverData);

      // Act
      const result = readDeliveryDriverCsv(mockFilePath);

      // Assert
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(mockFilePath, {
        encoding: 'utf-8',
      });
      expect(result).toEqual([
        {
          deliveryDriverId: 'POSTE',
          taxId: '01114601006',
          businessName: 'Poste',
          fiscalCode: '97103880585',
          pec: 'poste@pec.it',
          phoneNumber: '+39012-123456',
          registeredOffice: '',
          unifiedDeliveryDriver: 'POSTE',
        },
      ]);
    });
  });
});
