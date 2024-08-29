import {
  DeliveryDriverCSV,
  GeokeyCSV,
  TenderCSV,
  TenderCostsCSV,
} from '../types/csv-types';
import {
  PaperChannelDeliveryDriver,
  PaperChannelGeokey,
  PaperChannelTender,
  PaperChannelTenderCosts,
  PaperChannelTenderCostsRange,
} from '../types/dynamo-types';
import { rangeColumnPattern } from '../utils/regex';

/**
 * Constructs a unique key for the product, lot and zone.
 *
 * @param product - The product identifier.
 * @param lot - The lot identifier.
 * @param zone - The zone identifier.
 * @returns A string formatted as `${product}#${lot}#${zone}`.
 */
const buildProductLotZone = (
  product: string,
  lot: string,
  zone: string
): string => `${product}#${lot}#${zone}`;

/**
 * Constructs a unique key for the tender, product and geokey.
 *
 * @param tenderId - The tender identifier.
 * @param product - The product identifier.
 * @param geokey - The geokey identifier.
 * @returns A string formatted as `${tenderId}#${product}#${geokey}`.
 */
const buildTenderProductGeokey = (
  tenderId: string,
  product: string,
  geokey: string
): string => `${tenderId}#${product}#${geokey}`;

/**
 * Extracts and maps ranged costs from a CSV record into an array of
 * `PaperChannelTenderCostsRange` objects.
 *
 * @param record - The TenderCosts CSV record.
 * @returns An array of `PaperChannelTenderCostsRange` objects.
 * @throws If a range column does not match the expected pattern.
 */
const rangedCostsFromCSV = (
  record: TenderCostsCSV
): PaperChannelTenderCostsRange[] =>
  Object.keys(record)
    .filter((key) => rangeColumnPattern.test(key))
    .map((key) => {
      const match = key.match(rangeColumnPattern);
      if (!match || match.length < 3) {
        throw new Error(`Invalid range column ${key}`);
      }

      const minWeight = parseInt(match[1]!, 10);
      const maxWeight = parseInt(match[2]!, 10);
      // Ottiene il valore associato alla chiave range_{minWeight}_{maxWeight}
      const cost = record[key as keyof TenderCostsCSV];

      return {
        minWeight,
        maxWeight,
        cost,
      } as PaperChannelTenderCostsRange;
    });

/**
 * Converts a `TenderCSV` record into a `PaperChannelTender` object.
 *
 * @param record - The CSV record containing tender data.
 * @param tenderId - The identifier of the tender.
 * @returns A `PaperChannelTender` object.
 */
export const tenderCsvToPaperChannelTender = (
  record: TenderCSV,
  tenderId: string
): PaperChannelTender => {
  return {
    tenderId,
    activationDate: record.activationDate,
    tenderName: record.tenderName,
    vat: record.vat,
    nonDeductibleVat: record.nonDeductibleVat,
    fee: record.fee,
    pagePrice: record.pagePrice,
    basePriceAR: record.basePriceAR,
    basePriceRS: record.basePriceRS,
    basePrice890: record.basePrice890,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Converts a `TenderCostsCSV` record into a `PaperChannelTenderCosts`
 *  object.
 *
 * @param record - The CSV record containing tender costs data.
 * @param tenderId - The identifier of the tender.
 * @returns A `PaperChannelTenderCosts` object.
 */
export const tenderCostsCsvToPaperChannelTenderCosts = (
  record: TenderCostsCSV,
  tenderId: string
): PaperChannelTenderCosts => ({
  tenderId,
  productLotZone: buildProductLotZone(
    record.product,
    record.lot,
    record.zone
  ),
  product: record.product,
  lot: record.lot,
  zone: record.zone,
  deliveryDriverName: record.deliveryDriverName,
  deliveryDriverId: record.deliveryDriverId,
  dematerializationCost: record.dematerializationCost,
  rangedCosts: rangedCostsFromCSV(record),
  createdAt: new Date().toISOString(),
});

/**
 * Converts a `GeokeyCSV` record into a `PaperChannelGeokey` object.
 *
 * @param record - The CSV record containing geokey data.
 * @param tenderId - The identifier of the tender.
 * @param tenderActivationDate - The activation date of the tender.
 * @returns A `PaperChannelGeokey` object.
 */
export const geokeyCSVToPaperChannelGeokey = (
  record: GeokeyCSV,
  tenderId: string,
  tenderActivationDate: string
): PaperChannelGeokey => ({
  tenderProductGeokey: buildTenderProductGeokey(
    tenderId,
    record.product,
    record.geokey
  ),
  activationDate: record.activationDate ?? tenderActivationDate,
  tenderId,
  product: record.product,
  geokey: record.geokey,
  lot: record.lot,
  zone: record.zone,
  coverFlag: record.coverFlag,
  dismissed: record.dismissed,
  createdAt: new Date().toISOString(),
});

/**
 * Converts a `DeliveryDriverCSV` record into a `PaperChannelDeliveryDriver` 
 * object.
 *
 * @param record - The CSV record containing delivery driver data.
 * @returns A `PaperChannelDeliveryDriver` object.
 */
export const deliveryDriverCSVToPaperChannelDeliveryDriver = (
  record: DeliveryDriverCSV
): PaperChannelDeliveryDriver => ({
  deliveryDriverId: record.deliveryDriverId,
  taxId: record.taxId,
  businessName: record.businessName,
  fiscalCode: record.fiscalCode,
  pec: record.pec,
  phoneNumber: record.phoneNumber,
  registeredOffice: record.registeredOffice,
  createdAt: new Date().toISOString(),
});
