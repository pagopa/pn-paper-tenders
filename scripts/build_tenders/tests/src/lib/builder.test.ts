import {
  readDeliveryDriverCsv,
  readGeokeyCsv,
  readTenderCostsCsv,
  readTenderCsv,
} from '../../../src/lib/csv/reader';
import * as mappers from '../../../src/lib/mappers';
import {
  buildDynamoDbTender,
  buildDynamoDbCosts,
  buildDynamoDbGeokey,
  buildDynamoDbDeliveryDriver,
  DynamoDbTender,
} from '../../../src/lib/builder';
import { TenderFiles } from '../../../src/types/tenders-files-types';
import {
  DeliveryDriverCSV,
  GeokeyCSV,
  TenderCSV,
  TenderCostsCSV,
} from '../../../src/types/csv-types';
import {
  PaperChannelDeliveryDriver,
  PaperChannelGeokey,
  PaperChannelTenderCosts,
} from '../../../src/types/dynamo-types';

// Mock the CSV reading functions and the mapping functions
jest.mock('../../../src/lib/csv/reader');

describe('Tender builder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('buildDynamoDbCosts', () => {
    it('should build DynamoDB costs array', () => {
      // Arrange
      const mockTenderCostsCsv: TenderCostsCSV[] = [
        {
          product: 'RS',
          lot: '23',
          zone: 'EU',
          deliveryDriverName: 'Poste',
          deliveryDriverId: 'POSTE',
          dematerializationCost: 0.09876,
          range_0_20: 0.00123,
          range_21_50: 0.00987,
        },
      ];
      const mockPaperChannelTenderCosts: PaperChannelTenderCosts = {
        tenderId: 'mock-id',
        createdAt: expect.any(String),
        productLotZone: 'RS#23#EU',
        product: 'RS',
        lot: '23',
        zone: 'EU',
        deliveryDriverName: 'Poste',
        deliveryDriverId: 'POSTE',
        dematerializationCost: 0.09876,
        rangedCosts: [
          {
            cost: 0.00123,
            minWeight: 0,
            maxWeight: 20,
          },
          {
            cost: 0.00987,
            minWeight: 21,
            maxWeight: 50,
          },
        ],
      };

      const mockMarshalledData = {
        deliveryDriverId: {
          S: 'POSTE',
        },
        deliveryDriverName: {
          S: 'Poste',
        },
        dematerializationCost: {
          N: '0.09876',
        },
        lot: {
          S: '23',
        },
        product: {
          S: 'RS',
        },
        productLotZone: {
          S: 'RS#23#EU',
        },
        tenderId: {
          S: 'mock-id',
        },
        zone: {
          S: 'EU',
        },
        createdAt: {
          S: expect.any(String),
        },
        rangedCosts: {
          L: [
            {
              M: {
                cost: {
                  N: '0.00123',
                },
                maxWeight: {
                  N: '20',
                },
                minWeight: {
                  N: '0',
                },
              },
            },
            {
              M: {
                cost: {
                  N: '0.00987',
                },
                maxWeight: {
                  N: '50',
                },
                minWeight: {
                  N: '21',
                },
              },
            },
          ],
        },
      };

      (readTenderCostsCsv as jest.Mock).mockReturnValue(mockTenderCostsCsv);
      const spyMapper = jest.spyOn(
        mappers,
        'tenderCostsCsvToPaperChannelTenderCosts'
      );

      // Act
      const tenderFiles: Partial<TenderFiles> = {
        tenderCostsCsvPath: 'mock-path',
        tenderId: 'mock-id',
      };
      const result = buildDynamoDbCosts(tenderFiles as TenderFiles);

      // Assert
      expect(readTenderCostsCsv).toHaveBeenCalledWith('mock-path');
      expect(spyMapper).toHaveBeenCalledWith(mockTenderCostsCsv[0], 'mock-id');
      expect(spyMapper.mock.results[0]!.value).toEqual(
        expect.objectContaining(mockPaperChannelTenderCosts)
      );
      expect(result).toEqual(expect.objectContaining([mockMarshalledData]));
    });
  });

  describe('buildDynamoDbGeokey', () => {
    it('should build DynamoDB geokeys array', () => {
      // Arrange
      const activationDate = '2024-07-23T10:26:11.676Z';
      const mockGeokeyCsv: GeokeyCSV[] = [
        {
          activationDate: activationDate,
          geokey: '00100',
          product: 'RS',
          lot: '23',
          zone: 'EU',
          coverFlag: true,
          dismissed: false,
        },
      ];
      const mockPaperChannelGeokey: PaperChannelGeokey = {
        tenderId: 'mock-id',
        createdAt: expect.any(String),
        tenderProductGeokey: 'mock-id#RS#00100',
        product: 'RS',
        lot: '23',
        zone: 'EU',
        activationDate: activationDate,
        geokey: '00100',
        coverFlag: true,
        dismissed: false,
      };
      const mockMarshalledData = {
        tenderId: {
          S: 'mock-id',
        },
        createdAt: {
          S: expect.any(String),
        },
        tenderProductGeokey: {
          S: 'mock-id#RS#00100',
        },
        product: {
          S: 'RS',
        },
        lot: {
          S: '23',
        },
        zone: {
          S: 'EU',
        },
        activationDate: {
          S: activationDate,
        },
        geokey: {
          S: '00100',
        },
        coverFlag: {
          BOOL: true,
        },
        dismissed: {
          BOOL: false,
        },
      };

      (readGeokeyCsv as jest.Mock).mockReturnValue(mockGeokeyCsv);
      const spyMapper = jest.spyOn(mappers, 'geokeyCSVToPaperChannelGeokey');

      // Act
      const tenderFiles: Partial<TenderFiles> = {
        geokeysCsvPaths: ['mock-path'],
        tenderId: 'mock-id',
      };
      const result = buildDynamoDbGeokey(
        tenderFiles as TenderFiles,
        activationDate
      );

      // Assert
      expect(readGeokeyCsv).toHaveBeenCalledWith('mock-path');
      expect(spyMapper).toHaveBeenCalledWith(
        mockGeokeyCsv[0],
        'mock-id',
        activationDate
      );
      expect(spyMapper.mock.results[0]!.value).toEqual(
        expect.objectContaining(mockPaperChannelGeokey)
      );
      expect(result).toEqual(expect.objectContaining([mockMarshalledData]));
    });
  });

  describe('buildDynamoDbDeliveryDriver', () => {
    it('should build DynamoDB deliveryDriver', () => {
      // Arrange
      const mockDeliveryDriverCsv: DeliveryDriverCSV[] = [
        {
          deliveryDriverId: 'POSTE',
          taxId: '123456',
          businessName: 'Poste',
          fiscalCode: '123456',
          pec: 'poste@pec.com',
          phoneNumber: '12345678',
          registeredOffice: '',
          unifiedDeliveryDriver: 'POSTE',
        },
      ];
      const mockPaperChannelDeliveryDriver: PaperChannelDeliveryDriver = {
        deliveryDriverId: 'POSTE',
        taxId: '123456',
        businessName: 'Poste',
        fiscalCode: '123456',
        pec: 'poste@pec.com',
        phoneNumber: '12345678',
        registeredOffice: '',
        unifiedDeliveryDriver: 'POSTE',
        createdAt: expect.any(String),
      };

      const mockMarshalledData = {
        deliveryDriverId: {
          S: 'POSTE',
        },
        taxId: {
          S: '123456',
        },
        businessName: {
          S: 'Poste',
        },
        fiscalCode: {
          S: '123456',
        },
        pec: {
          S: 'poste@pec.com',
        },
        phoneNumber: {
          S: '12345678',
        },
        registeredOffice: {
          S: '',
        },
        unifiedDeliveryDriver: {
          S: 'POSTE',
        },
        createdAt: {
          S: expect.any(String),
        },
      };

      (readDeliveryDriverCsv as jest.Mock).mockReturnValue(
        mockDeliveryDriverCsv
      );
      const spyMapper = jest.spyOn(
        mappers,
        'deliveryDriverCSVToPaperChannelDeliveryDriver'
      );

      // Act
      const tenderFiles: Partial<TenderFiles> = {
        deliveryDriverCsvPath: 'mock-path',
        tenderId: 'mock-id',
      };
      const result = buildDynamoDbDeliveryDriver(tenderFiles as TenderFiles);

      // Assert
      expect(readDeliveryDriverCsv).toHaveBeenCalledWith('mock-path');
      expect(spyMapper).toHaveBeenCalledWith(mockDeliveryDriverCsv[0]);
      expect(spyMapper.mock.results[0]!.value).toEqual(
        expect.objectContaining(mockPaperChannelDeliveryDriver)
      );
      expect(result).toEqual(expect.objectContaining([mockMarshalledData]));
    });
  });

  describe('buildDynamoDbTender', () => {
    it('should build DynamoDB tender', () => {
      // Arrange
      const activationDate = '2019-07-24T00:00:00.000Z';
      const tenderId = '20190724'
      const tenderFiles: TenderFiles = {
        deliveryDriverCsvPath: 'mock-path',
        tenderCostsCsvPath: 'mock-path',
        tenderCsvPath: 'mock-path',
        geokeysCsvPaths: ['mock-path'],
        tenderDirPath: 'mock-path',
        tenderId: tenderId,
      };

      const mockDeliveryDriverCsv: DeliveryDriverCSV[] = [
        {
          deliveryDriverId: 'POSTE',
          taxId: '123456',
          businessName: 'Poste',
          fiscalCode: '123456',
          pec: 'poste@pec.com',
          phoneNumber: '12345678',
          registeredOffice: '',
          unifiedDeliveryDriver: 'POSTE',
        },
      ];

      const mockMarshalledDeliveryDriver = {
        deliveryDriverId: {
          S: 'POSTE',
        },
        taxId: {
          S: '123456',
        },
        businessName: {
          S: 'Poste',
        },
        fiscalCode: {
          S: '123456',
        },
        pec: {
          S: 'poste@pec.com',
        },
        phoneNumber: {
          S: '12345678',
        },
        registeredOffice: {
          S: '',
        },
        unifiedDeliveryDriver: {
          S: 'POSTE',
        },
        createdAt: {
          S: expect.any(String),
        },
      };

      const mockTenderCostsCsv: TenderCostsCSV[] = [
        {
          product: 'RS',
          lot: '23',
          zone: 'EU',
          deliveryDriverName: 'Poste',
          deliveryDriverId: 'POSTE',
          dematerializationCost: 0.09876,
          range_0_20: 0.00123,
          range_21_50: 0.00987,
        },
      ];

      const mockMarshalledTenderCosts = {
        deliveryDriverId: {
          S: 'POSTE',
        },
        deliveryDriverName: {
          S: 'Poste',
        },
        dematerializationCost: {
          N: '0.09876',
        },
        lot: {
          S: '23',
        },
        product: {
          S: 'RS',
        },
        productLotZone: {
          S: 'RS#23#EU',
        },
        tenderId: {
          S: tenderId,
        },
        zone: {
          S: 'EU',
        },
        createdAt: {
          S: expect.any(String),
        },
        rangedCosts: {
          L: [
            {
              M: {
                cost: {
                  N: '0.00123',
                },
                maxWeight: {
                  N: '20',
                },
                minWeight: {
                  N: '0',
                },
              },
            },
            {
              M: {
                cost: {
                  N: '0.00987',
                },
                maxWeight: {
                  N: '50',
                },
                minWeight: {
                  N: '21',
                },
              },
            },
          ],
        },
      };

      const mockGeokeyCsv: GeokeyCSV[] = [
        {
          activationDate: activationDate,
          geokey: '00100',
          product: 'RS',
          lot: '23',
          zone: 'EU',
          coverFlag: true,
          dismissed: false,
        },
      ];

      const mockMarshalledGeokey = {
        tenderId: {
          S: tenderId,
        },
        createdAt: {
          S: expect.any(String),
        },
        tenderProductGeokey: {
          S: `${tenderId}#RS#00100`,
        },
        product: {
          S: 'RS',
        },
        lot: {
          S: '23',
        },
        zone: {
          S: 'EU',
        },
        activationDate: {
          S: activationDate,
        },
        geokey: {
          S: '00100',
        },
        coverFlag: {
          BOOL: true,
        },
        dismissed: {
          BOOL: false,
        },
      };

      const mockTenderCsv: TenderCSV[] = [
        {
          activationDate: activationDate,
          tenderName: tenderId,
          vat: 22,
          nonDeductibleVat: 35,
          fee: 0.50025,
          pagePrice: 0.12345,
          basePriceAR: 0.05945,
          basePriceRS: 0.01234,
          basePrice890: 0.09432,
        },
      ];

      const mockMarshalledTender = {
        activationDate: {
          S: activationDate,
        },
        tenderName: {
          S: tenderId,
        },
        tenderId: {
          S: tenderId,
        },
        vat: {
          N: '22',
        },
        nonDeductibleVat: {
          N: '35',
        },
        fee: {
          N: '0.50025',
        },
        pagePrice: {
          N: '0.12345',
        },
        basePriceAR: {
          N: '0.05945',
        },
        basePriceRS: {
          N: '0.01234',
        },
        basePrice890: {
          N: '0.09432',
        },
        createdAt: {
          S: expect.any(String),
        },
      };

      const expected: DynamoDbTender = {
        tender: [mockMarshalledTender],
        tenderCosts: [mockMarshalledTenderCosts],
        geokey: [mockMarshalledGeokey],
        deliveryDriver: [mockMarshalledDeliveryDriver],
      };

      (readTenderCostsCsv as jest.Mock).mockReturnValue(mockTenderCostsCsv);
      (readGeokeyCsv as jest.Mock).mockReturnValue(mockGeokeyCsv);
      (readDeliveryDriverCsv as jest.Mock).mockReturnValue(
        mockDeliveryDriverCsv
      );
      (readTenderCsv as jest.Mock).mockReturnValue(mockTenderCsv);

      // Act
      const result = buildDynamoDbTender(tenderFiles as TenderFiles);

      // Assert
      expect(result).toEqual(expect.objectContaining(expected));
    });
  });
});
