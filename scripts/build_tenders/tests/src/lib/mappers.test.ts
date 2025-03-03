import {
  tenderCsvToPaperChannelTender,
  tenderCostsCsvToPaperChannelTenderCosts,
  geokeyCSVToPaperChannelGeokey,
  deliveryDriverCSVToPaperChannelDeliveryDriver,
  rangedCostsFromCSV,
  capacityCSVToPaperDeliveryDriverCapacities,
} from '../../../src/lib/mappers';
import {
  TenderCSV,
  TenderCostsCSV,
  GeokeyCSV,
  CapacityCSV,
  DeliveryDriverCSV,
} from '../../../src/types/csv-types';
import {
  PaperChannelTender,
  PaperChannelTenderCosts,
  PaperChannelGeokey,
  PaperDeliveryDriverCapacities,
  PaperChannelDeliveryDriver,
  PaperChannelTenderCostsRange,
} from '../../../src/types/dynamo-types';

describe('CSV to PaperChannel converters', () => {
  describe('tenderCsvToPaperChannelTender', () => {
    it('should convert a TenderCSV to a PaperChannelTender', () => {
      // Arrange
      const tenderId = 'tender123';
      const record: TenderCSV = {
        activationDate: '2024-08-01',
        tenderName: 'Tender 2024',
        vat: 22,
        nonDeductibleVat: 2,
        fee: 1000,
        pagePrice: 0.1,
        basePriceAR: 0.2,
        basePriceRS: 0.3,
        basePrice890: 0.4,
      };

      // Act
      const result: PaperChannelTender = tenderCsvToPaperChannelTender(
        record,
        tenderId
      );

      // Assert
      expect(result).toEqual({
        tenderId: tenderId,
        activationDate: record.activationDate,
        tenderName: record.tenderName,
        vat: record.vat,
        nonDeductibleVat: record.nonDeductibleVat,
        fee: record.fee,
        pagePrice: record.pagePrice,
        basePriceAR: record.basePriceAR,
        basePriceRS: record.basePriceRS,
        basePrice890: record.basePrice890,
        createdAt: expect.any(String),
      });
    });
  });

  describe('tenderCostsCsvToPaperChannelTenderCosts', () => {
    it('should convert a TenderCostsCSV to a PaperChannelTenderCosts', () => {
      // Arrange
      const tenderId = 'tender123';
      const record: TenderCostsCSV = {
        product: 'Product1',
        lot: 'Lot1',
        zone: 'Zone1',
        deliveryDriverName: 'Driver1',
        deliveryDriverId: 'DriverId1',
        dematerializationCost: 100,
        range_1_10: 50,
        range_11_20: 75,
      };

      // Act
      const result: PaperChannelTenderCosts =
        tenderCostsCsvToPaperChannelTenderCosts(record, tenderId);

      // Assert
      expect(result).toEqual({
        tenderId: tenderId,
        productLotZone: 'Product1#Lot1#Zone1',
        product: record.product,
        lot: record.lot,
        zone: record.zone,
        deliveryDriverName: record.deliveryDriverName,
        deliveryDriverId: record.deliveryDriverId,
        dematerializationCost: record.dematerializationCost,
        rangedCosts: [
          { minWeight: 1, maxWeight: 10, cost: 50 },
          { minWeight: 11, maxWeight: 20, cost: 75 },
        ],
        createdAt: expect.any(String),
      });
    });
  });

  describe('rangedCostsFromCSV', () => {
    it('should correctly parse ranged costs from a TenderCostsCSV record', () => {
      // Arrange
      const record: TenderCostsCSV = {
        product: 'Product1',
        lot: 'Lot1',
        zone: 'Zone1',
        deliveryDriverName: 'Driver1',
        deliveryDriverId: 'DriverId1',
        dematerializationCost: 100,
        range_1_10: 50,
        range_11_20: 75,
        range_21_30: 100,
      };

      // Act
      const result: PaperChannelTenderCostsRange[] = rangedCostsFromCSV(record);

      // Assert
      expect(result).toEqual([
        { minWeight: 1, maxWeight: 10, cost: 50 },
        { minWeight: 11, maxWeight: 20, cost: 75 },
        { minWeight: 21, maxWeight: 30, cost: 100 },
      ]);
    });
  });

  describe('geokeyCSVToPaperChannelGeokey', () => {
    it('should convert a GeokeyCSV to a PaperChannelGeokey', () => {
      // Arrange
      const tenderId = 'tender123';
      const tenderActivationDate = '2024-07-23T10:26:11.676Z';
      const record: GeokeyCSV = {
        product: 'Product1',
        geokey: 'GeoKey1',
        lot: 'Lot1',
        zone: 'Zone1',
        coverFlag: true,
        dismissed: false,
        activationDate: '2024-07-23T10:26:11.676Z',
      };

      // Act
      const result: PaperChannelGeokey = geokeyCSVToPaperChannelGeokey(
        record,
        tenderId,
        tenderActivationDate
      );

      // Assert
      expect(result).toEqual({
        tenderProductGeokey: 'tender123#Product1#GeoKey1',
        activationDate: record.activationDate,
        tenderId: tenderId,
        product: record.product,
        geokey: record.geokey,
        lot: record.lot,
        zone: record.zone,
        coverFlag: record.coverFlag,
        dismissed: record.dismissed,
        createdAt: expect.any(String),
      });
    });

    it('should use tenderActivationDate if activationDate is missing', () => {
      // Arrange
      const tenderId = 'tender123';
      const tenderActivationDate = '2024-07-23T10:26:11.676Z';
      const record: Partial<GeokeyCSV> = {
        product: 'Product1',
        geokey: 'GeoKey1',
        lot: 'Lot1',
        zone: 'Zone1',
        coverFlag: true,
        dismissed: false,
      };

      // Act
      const result: PaperChannelGeokey = geokeyCSVToPaperChannelGeokey(
        record as GeokeyCSV,
        tenderId,
        tenderActivationDate
      );

      // Assert
      expect(result.activationDate).toBe(tenderActivationDate);
    });
  });

  describe('capacityCSVToPaperChannelCapacity', () => {
      it('should convert a CapacityCSV to a PaperChannelCapacity in second csv version', () => {
        // Arrange
        const tenderId = 'tender123';
        const record: CapacityCSV = {
          deliveryDriverId: '1',
          geoKey: 'NA',
          capacity: 1000,
          peakCapacity: 2000,
          activationDateFrom: '2025-03-01T00:00:00Z',
          activationDateTo: '2025-04-01T00:00:00Z',
        };

        // Act
        const result: PaperDeliveryDriverCapacities = capacityCSVToPaperDeliveryDriverCapacities(
          record,
          tenderId,
          Date.now().toString()
        );

        // Assert
        expect(result).toEqual({
          pk: '#tender123##1##NA',
          activationDateFrom: "2025-03-01T00:00:00Z",
          activationDateTo: '2025-04-01T00:00:00Z',
          tenderId: 'tender123',
          deliveryDriverId: '1',
          geoKey: 'NA',
          capacity: 1000,
          peakCapacity: 2000,
          createdAt: expect.any(String),
        });
      });

      it('should use undefined for activationDateTo in first version of file', () => {
        // Arrange
       const tenderId = 'tender123';
               const record: CapacityCSV = {
                 deliveryDriverId: '1',
                 geoKey: 'NA',
                 capacity: 1000,
                 peakCapacity: 2000,
                 activationDateFrom: '2025-03-01T00:00:00Z',
                 activationDateTo: '',
               };

               // Act
               const result: PaperDeliveryDriverCapacities = capacityCSVToPaperDeliveryDriverCapacities(
                 record,
                 tenderId,
                 Date.now().toString()
               );

               // Assert
               expect(result).toEqual({
                 pk: '#tender123##1##NA',
                 activationDateFrom: '2025-03-01T00:00:00Z',
                 activationDateTo: undefined,
                 tenderId: 'tender123',
                 deliveryDriverId: '1',
                 geoKey: 'NA',
                 capacity: 1000,
                 peakCapacity: 2000,
                 createdAt: expect.any(String),
               });
    });
  });

  describe('deliveryDriverCSVToPaperChannelDeliveryDriver', () => {
    it('should convert a DeliveryDriverCSV to a PaperChannelDeliveryDriver', () => {
      // Arrange
      const record: DeliveryDriverCSV = {
        deliveryDriverId: 'DriverId1',
        taxId: 'TaxId1',
        businessName: 'BusinessName1',
        fiscalCode: 'FiscalCode1',
        pec: 'pec@example.com',
        phoneNumber: '1234567890',
        registeredOffice: 'RegisteredOffice1',
      };

      // Act
      const result: PaperChannelDeliveryDriver =
        deliveryDriverCSVToPaperChannelDeliveryDriver(record);

      // Assert
      expect(result).toEqual({
        deliveryDriverId: record.deliveryDriverId,
        taxId: record.taxId,
        businessName: record.businessName,
        fiscalCode: record.fiscalCode,
        pec: record.pec,
        phoneNumber: record.phoneNumber,
        registeredOffice: record.registeredOffice,
        createdAt: expect.any(String),
      });
    });
  });
});
