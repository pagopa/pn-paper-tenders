import {
  readDeliveryDriverCsv,
  readGeokeyCsv,
  readTenderCostsCsv,
  readTenderCsv,
  readCapacityCsv
} from '../../../src/lib/csv/reader';
import * as mappers from '../../../src/lib/mappers';
import {
  buildDynamoDbTender,
  buildDynamoDbCosts,
  buildDynamoDbGeokey,
  buildDynamoDbCapacity,
  buildDynamoDbDeliveryDriver,
  DynamoDbTender,
} from '../../../src/lib/builder';
import { TenderFiles } from '../../../src/types/tenders-files-types';
import {
  DeliveryDriverCSV,
  GeokeyCSV,
  CapacityCSV,
  TenderCSV,
  TenderCostsCSV,
} from '../../../src/types/csv-types';
import {
  PaperChannelDeliveryDriver,
  PaperChannelGeokey,
  PaperDeliveryDriverCapacities,
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

  describe('buildDynamoDbCapacity', () => {
    it('should build DynamoDB capacity array with invalid date interval 1', () => {
      // Arrange
      const mockCapacityCsv: CapacityCSV[] = [
        {
          deliveryDriverId: '1',
          geoKey: 'NA',
          capacity: 1000,
          peakCapacity: 2000,
          activationDateFrom: '2025-03-01T00:00:00.000Z',
          activationDateTo: '2025-04-01T00:00:00.000Z',
        },
        {
          deliveryDriverId: '1',
          geoKey: 'NA',
          capacity: 1000,
          peakCapacity: 2000,
          activationDateFrom: '2025-03-20T00:00:00.000Z',
          activationDateTo: '2025-04-20T00:00:00.000Z',
        },
      ];


      (readCapacityCsv as jest.Mock).mockReturnValue(mockCapacityCsv);
      const spyMapper = jest.spyOn(mappers, 'capacityCSVToPaperDeliveryDriverCapacities');

      // Act
      const tenderFiles: Partial<TenderFiles> = {
        capacityCsvPaths: ['mock-path'],
        tenderId: 'mock-id',
      };

      expect(() => buildDynamoDbCapacity(
         tenderFiles as TenderFiles,
        "2025-01-01T00:00:00.000Z"
      )).toThrow('Intervals overlap or are nested for geoKey: NA and deliveryDriverId: 1 for record with activationDateFrom: 2025-03-20T00:00:00.000Z and activationDateTo: 2025-04-20T00:00:00.000Z');

      // Assert
      expect(readCapacityCsv).toHaveBeenCalledWith('mock-path');
      expect(spyMapper).toHaveBeenCalledWith(
        mockCapacityCsv[0],
        'mock-id',
        "2025-01-01T00:00:00.000Z"
      );
  });

  it('should build DynamoDB capacity array with invalid date interval 2', () => {
        // Arrange
        const mockCapacityCsv: CapacityCSV[] = [
          {
            deliveryDriverId: '1',
            geoKey: 'NA',
            capacity: 1000,
            peakCapacity: 2000,
            activationDateFrom: '2025-03-01T00:00:00.000Z',
            activationDateTo: '2025-04-01T00:00:00.000Z',
          },
          {
            deliveryDriverId: '1',
            geoKey: 'NA',
            capacity: 1000,
            peakCapacity: 2000,
            activationDateFrom: '2025-03-20T00:00:00.000Z',
            activationDateTo: '2025-03-25T00:00:00.000Z',
          },
        ];


        (readCapacityCsv as jest.Mock).mockReturnValue(mockCapacityCsv);
        const spyMapper = jest.spyOn(mappers, 'capacityCSVToPaperDeliveryDriverCapacities');

        // Act
        const tenderFiles: Partial<TenderFiles> = {
          capacityCsvPaths: ['mock-path'],
          tenderId: 'mock-id',
        };

        expect(() => buildDynamoDbCapacity(
           tenderFiles as TenderFiles,
          "2025-01-01T00:00:00.000Z"
        )).toThrow('Intervals overlap or are nested for geoKey: NA and deliveryDriverId: 1 for record with activationDateFrom: 2025-03-20T00:00:00.000Z and activationDateTo: 2025-03-25T00:00:00.000Z');

        // Assert
        expect(readCapacityCsv).toHaveBeenCalledWith('mock-path');
        expect(spyMapper).toHaveBeenCalledWith(
          mockCapacityCsv[0],
          'mock-id',
          "2025-01-01T00:00:00.000Z"
        );
    });

it('should build DynamoDB capacity array with valid date interval', () => {
        // Arrange
        const mockCapacityCsv: CapacityCSV[] = [
          {
            deliveryDriverId: '1',
            geoKey: 'RM',
            capacity: 1000,
            peakCapacity: 2000,
            activationDateFrom: '',
            activationDateTo: '',
          },
          {
            deliveryDriverId: '1',
            geoKey: 'NA',
            capacity: 1000,
            peakCapacity: 2000,
            activationDateFrom: '2025-02-01T00:00:00.000Z',
            activationDateTo: '',
          },
          {
            deliveryDriverId: '1',
            geoKey: 'NA',
            capacity: 1000,
            peakCapacity: 2000,
            activationDateFrom: '2025-03-01T00:00:00.000Z',
            activationDateTo: '2025-04-01T00:00:00.000Z',
          },
          {
            deliveryDriverId: '1',
            geoKey: 'NA',
            capacity: 1000,
            peakCapacity: 2000,
            activationDateFrom: '2025-03-20T00:00:00.000Z',
            activationDateTo: '1970-01-01T00:00:00.000Z',
          },
        ];


        const mockPaperChannelCapacity: PaperDeliveryDriverCapacities[] = [
            {
              pk: 'mock-id##1##RM',
              activationDateFrom: '2025-01-01T00:00:00.000Z',
              activationDateTo: undefined,
              tenderId: 'mock-id',
              deliveryDriverId: '1',
              geoKey: 'RM',
              capacity: 1000,
              peakCapacity: 2000,
              createdAt: expect.any(String),
            },
            {
              pk: 'mock-id##1##NA',
              activationDateFrom: '2025-02-01T00:00:00.000Z',
              activationDateTo: undefined,
              tenderId: 'mock-id',
              deliveryDriverId: '1',
              geoKey: 'NA',
              capacity: 1000,
              peakCapacity: 2000,
              createdAt: expect.any(String),
            },
            {
              pk: 'mock-id##1##NA',
              activationDateFrom: '2025-03-01T00:00:00.000Z',
              activationDateTo: '2025-04-01T00:00:00.000Z',
              tenderId: 'mock-id',
              deliveryDriverId: '1',
              geoKey: 'NA',
              capacity: 1000,
              peakCapacity: 2000,
              createdAt: expect.any(String),
            },
            {
              pk: 'mock-id##1##NA',
              activationDateFrom: '2025-03-20T00:00:00.000Z',
              activationDateTo: '1970-01-01T00:00:00.000Z',
              tenderId: 'mock-id',
              deliveryDriverId: '1',
              geoKey: 'NA',
              capacity: 1000,
              peakCapacity: 2000,
              createdAt: expect.any(String),
            }
        ];
        const mockMarshalledData = [
        {
              pk: {
                S: 'mock-id##1##RM',
              },
              activationDateFrom: {
                S: '2025-01-01T00:00:00.000Z',
              },
              tenderId: {
                S: 'mock-id',
              },
              deliveryDriverId: {
                S: '1',
              },
              geoKey: {
                S: 'RM',
              },
              capacity: {
                N: '1000',
              },
              peakCapacity: {
                N: '2000'
              },
              createdAt: {
                S: expect.any(String),
              }
            },
            {  
              pk: {
                S: 'mock-id##1##NA',
              },
              activationDateFrom: {
                S: '2025-02-01T00:00:00.000Z',
              },
              tenderId: {
                S: 'mock-id',
              },
              deliveryDriverId: {
                S: '1',
              },
              geoKey: {
                S: 'NA',
              },
              capacity: {
                N: '1000',
              },
              peakCapacity: {
                N: '2000'
              },
              createdAt: {
                S: expect.any(String),
              }
            },
            {
              pk: {
                S: 'mock-id##1##NA',
              },
              activationDateFrom: {
                S: '2025-03-01T00:00:00.000Z',
              },
              activationDateTo: {
                S: '2025-04-01T00:00:00.000Z',
              },
              tenderId: {
                S: 'mock-id',
              },
              deliveryDriverId: {
                S: '1',
              },
              geoKey: {
                S: 'NA',
              },
              capacity: {
                N: '1000',
              },
              peakCapacity: {
                N: '2000'
              },
              createdAt: {
                S: expect.any(String),
              }
            },
            {
              pk: {
                S: 'mock-id##1##NA',
              },
              activationDateFrom: {
                S: '2025-03-20T00:00:00.000Z',
              },
              activationDateTo: {
                S: '1970-01-01T00:00:00.000Z',
              },
              tenderId: {
                S: 'mock-id',
              },
              deliveryDriverId: {
                S: '1',
              },
              geoKey: {
                S: 'NA',
              },
              capacity: {
                N: '1000',
              },
              peakCapacity: {
                N: '2000'
              },
              createdAt: {
                S: expect.any(String),
              }
            }
        ];
    
        (readCapacityCsv as jest.Mock).mockReturnValue(mockCapacityCsv);
          // Act
          const tenderFiles: Partial<TenderFiles> = {
            capacityCsvPaths: ['mock-path'],
            tenderId: 'mock-id',
          };
          const result = buildDynamoDbCapacity(
            tenderFiles as TenderFiles,
            "2025-01-01T00:00:00.000Z"
          );
    
          // Assert
          expect(readCapacityCsv).toHaveBeenCalledWith('mock-path');
          expect(result).toEqual(mockMarshalledData);
        });
      
   
  it('should build DynamoDB capacity array', () => {
    // Arrange
    const mockCapacityCsv: CapacityCSV[] = [
      {
        deliveryDriverId: '1',
        geoKey: 'NA',
        capacity: 1000,
        peakCapacity: 2000,
        activationDateFrom: '2025-03-01T00:00:00.000Z',
        activationDateTo: '2025-04-01T00:00:00.000Z',
      },
    ];
    const mockPaperChannelCapacity: PaperDeliveryDriverCapacities = {
      pk: 'mock-id##1##NA',
      activationDateFrom: '2025-03-01T00:00:00.000Z',
      activationDateTo: '2025-04-01T00:00:00.000Z',
      tenderId: 'mock-id',
      deliveryDriverId: '1',
      geoKey: 'NA',
      capacity: 1000,
      peakCapacity: 2000,
      createdAt: expect.any(String),
    };
    const mockMarshalledData = {
      pk: {
        S: 'mock-id##1##NA',
      },
      activationDateFrom: {
        S: '2025-03-01T00:00:00.000Z',
      },
      activationDateTo: {
        S: '2025-04-01T00:00:00.000Z',
      },
      tenderId: {
        S: 'mock-id',
      },
      deliveryDriverId: {
        S: '1',
      },
      geoKey: {
        S: 'NA',
      },
      capacity: {
        N: '1000',
      },
      peakCapacity: {
        N: '2000'
      },
      createdAt: {
        S: expect.any(String),
      }
    };

    (readCapacityCsv as jest.Mock).mockReturnValue(mockCapacityCsv);
    const spyMapper = jest.spyOn(mappers, 'capacityCSVToPaperDeliveryDriverCapacities');

      // Act
      const tenderFiles: Partial<TenderFiles> = {
        capacityCsvPaths: ['mock-path'],
        tenderId: 'mock-id',
      };
      const result = buildDynamoDbCapacity(
        tenderFiles as TenderFiles,
        "2025-01-01T00:00:00.000Z"
      );

      // Assert
      expect(readCapacityCsv).toHaveBeenCalledWith('mock-path');
      expect(spyMapper).toHaveBeenCalledWith(
        mockCapacityCsv[0],
        'mock-id',
        "2025-01-01T00:00:00.000Z"
      );
      expect(spyMapper.mock.results[0]!.value).toEqual(
        expect.objectContaining(mockPaperChannelCapacity)
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
        capacityCsvPaths: ['mock-path'],
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

      const mockCapacityCsv: CapacityCSV[] = [
        {
          deliveryDriverId: 'POSTE',
          geoKey: 'NA',
          capacity: 1000,
          peakCapacity: 2000,
          activationDateFrom: '2025-03-01T00:00:00.000Z',
          activationDateTo: '2025-04-01T00:00:00.000Z',
        },
      ];

      const mockMarshalledCapacity = {
        pk: {
          S: `${tenderId}##POSTE##NA`,
        },
        activationDateFrom: {
          S: '2025-03-01T00:00:00.000Z',
        },
        activationDateTo: {
          S: '2025-04-01T00:00:00.000Z',
        },
        tenderId: {
          S: tenderId,
        },
        deliveryDriverId: {
          S: 'POSTE',
        },
        geoKey: {
          S: 'NA',
        },
        capacity: {
          N: '1000',
        },
        peakCapacity: {
          N: '2000',
        },
        createdAt: {
          S: expect.any(String),
        }
      }

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
        capacity: [mockMarshalledCapacity]
      };

      (readTenderCostsCsv as jest.Mock).mockReturnValue(mockTenderCostsCsv);
      (readGeokeyCsv as jest.Mock).mockReturnValue(mockGeokeyCsv);
      (readCapacityCsv as jest.Mock).mockReturnValue(mockCapacityCsv);
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
