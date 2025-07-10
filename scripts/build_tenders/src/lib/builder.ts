import {
  readDeliveryDriverCsv,
  readGeokeyCsv,
  readTenderCostsCsv,
  readTenderCsv,
  readCapacityCsv,
  readProvinceCsv,
} from './csv/reader';
import {
  deliveryDriverCSVToPaperChannelDeliveryDriver,
  geokeyCSVToPaperChannelGeokey,
  tenderCostsCsvToPaperChannelTenderCosts,
  tenderCsvToPaperChannelTender,
  capacityCSVToPaperDeliveryDriverCapacities,
  provinceCSVToPaperChannelProvince,
} from './mappers';
import { PaperChannelTender, PaperDeliveryDriverCapacities } from '../types/dynamo-types';
import { TenderFiles } from '../types/tenders-files-types';
import { marshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

export type DynamoDbTender = {
  tender: Record<string, AttributeValue>[];
  tenderCosts: Record<string, AttributeValue>[];
  geokey: Record<string, AttributeValue>[];
  deliveryDriver: Record<string, AttributeValue>[];
  capacity: Record<string, AttributeValue>[];
  province: Record<string, AttributeValue>[];
};

/**
 * Builds an array of tender cost records suitable for DynamoDB.
 *
 * @param {TenderFiles} tenderFiles - The object containing paths
 * to the CSV files related to the tender.
 * @returns {Record<string, AttributeValue>[]} An array of marshalled
 * tender cost records.
 */
export const buildDynamoDbCosts = (
  tenderFiles: TenderFiles
): Record<string, AttributeValue>[] =>
  readTenderCostsCsv(tenderFiles.tenderCostsCsvPath)
    .map((tenderCostsCsv) =>
      tenderCostsCsvToPaperChannelTenderCosts(
        tenderCostsCsv,
        tenderFiles.tenderId
      )
    )
    .map((tenderCosts) => marshall(tenderCosts));

/**
 * Builds an array of geokey records suitable for DynamoDB.
 *
 * @param {TenderFiles} tenderFiles - The object containing paths
 * to the CSV files related to the tender.
 * @param {string} activationDate - The activation date for the
 * geokey entries.
 * @returns {Record<string, AttributeValue>[]} An array of marshalled
 * geokey records.
 */
export const buildDynamoDbGeokey = (
  tenderFiles: TenderFiles,
  activationDate: string
): Record<string, AttributeValue>[] =>
  tenderFiles.geokeysCsvPaths
    .flatMap((geokey) => readGeokeyCsv(geokey))
    .map((geokeyCsv) =>
      geokeyCSVToPaperChannelGeokey(
        geokeyCsv,
        tenderFiles.tenderId,
        activationDate
      )
    )
    .map((geokey) => marshall(geokey));

/**
 * Builds an array of capacity records suitable for DynamoDB.
 *
 * @param {TenderFiles} tenderFiles - The object containing paths
 * to the CSV files related to the tender.
 * @param {string} activationDate - The activation date for the
 * capacity entries.
 * @returns {Record<string, AttributeValue>[]} An array of marshalled
 * capacity records.
 */
export const buildDynamoDbCapacity = (
  tenderFiles: TenderFiles,
  activationDate: string
): Record<string, AttributeValue>[] => {
    let capacityRecords = tenderFiles.capacityCsvPaths
      .flatMap((capacity) => readCapacityCsv(capacity))
      .map((capacityCsv) =>
        capacityCSVToPaperDeliveryDriverCapacities(
          capacityCsv,
          tenderFiles.tenderId,
          activationDate
        )
      );
    
    checkInterval(capacityRecords);
    
    return capacityRecords.map((capacity) => marshall(capacity, {removeUndefinedValues:true}))
  }

  const checkInterval = (capacityRecords: PaperDeliveryDriverCapacities[]) => {
    const groupedRecords = groupCapacityByGeoKeyAndDeliveryDriver(capacityRecords);

    for (const key in groupedRecords) {
      const records = groupedRecords[key]!;
      const filteredRecord = records.sort((a, b) => new Date(a.activationDateFrom).getTime() - new Date(b.activationDateFrom).getTime())
        .filter((record) => record.activationDateTo)
        .filter((record) => record.activationDateFrom < record.activationDateTo!);
      
      if(filteredRecord.length > 1) {
        filteredRecord.reduce((prev, current) => {
            if (prev.activationDateTo! >= current.activationDateFrom) {
              throw new Error(`Intervals overlap or are nested for geoKey: ${prev.geoKey} and unifiedDeliveryDriver: ${prev.unifiedDeliveryDriver} for record with activationDateFrom: ${current.activationDateFrom} and activationDateTo: ${current.activationDateTo}`);
            }
          return current;
        });
      }
    }
  };

  const groupCapacityByGeoKeyAndDeliveryDriver = (  capacityRecords: PaperDeliveryDriverCapacities[] = [] ): 
  Record<string, PaperDeliveryDriverCapacities[]> => capacityRecords.reduce((acc, record) => {
    const key = `${record.geoKey}-${record.unifiedDeliveryDriver}`;
    if (!acc[key]) {
    acc[key] = [];
    }
    acc[key].push(record);
    return acc;
  }, {} as Record<string, PaperDeliveryDriverCapacities[]>);


/**
 * Builds an array of delivery driver records suitable for DynamoDB.
 *
 * @param {TenderFiles} tenderFiles - The object containing paths
 * to the CSV files related to the tender.
 * @returns {Record<string, AttributeValue>[]} An array of marshalled
 * delivery driver records.
 */
export const buildDynamoDbDeliveryDriver = (
  tenderFiles: TenderFiles
): Record<string, AttributeValue>[] =>
  readDeliveryDriverCsv(tenderFiles.deliveryDriverCsvPath)
    .map((deliveryDriverCsv) =>
      deliveryDriverCSVToPaperChannelDeliveryDriver(deliveryDriverCsv)
    )
    .map((deliveryDriver) => marshall(deliveryDriver));


export const buildDynamoDbProvince = (
  tenderFiles: TenderFiles
): Record<string, AttributeValue>[] =>
  readProvinceCsv(tenderFiles.provincesCsvPath)
    .map((provinceCsv) =>
      provinceCSVToPaperChannelProvince(provinceCsv)
    )
    .map((province) => marshall(province));

/**
 * Builds a DynamoDbTender object containing marshalled data for
 * the tender, tender costs, geokey, and delivery driver records.
 *
 * @param {TenderFiles} tenderFiles - The object containing paths
 * to the CSV files related to the tender.
 * @returns {DynamoDbTender} The DynamoDbTender object containing
 * all marshalled records.
 */
export const buildDynamoDbTender = (
  tenderFiles: TenderFiles
): DynamoDbTender => {
  let tender: PaperChannelTender | undefined;

  console.table(`- tender ${tenderFiles.tenderDirPath}`);
  // Build DynamoDb tender
  const tenderDynamoDb = readTenderCsv(tenderFiles.tenderCsvPath)
    .map((tenderCsv) => {
      tender = tenderCsvToPaperChannelTender(tenderCsv, tenderFiles.tenderId);
      return tender;
    })
    .map((tender) => marshall(tender));

  if (!tender) {
    throw Error(`Tender row not found in ${tenderFiles.tenderCsvPath}`);
  }

  if (tenderDynamoDb.length > 1) {
    throw Error(
      `More than one Tender row found in ${tenderFiles.tenderCsvPath}`
    );
  }

  return {
    tender: tenderDynamoDb,
    tenderCosts: buildDynamoDbCosts(tenderFiles),
    geokey: buildDynamoDbGeokey(tenderFiles, tender!.activationDate),
    deliveryDriver: buildDynamoDbDeliveryDriver(tenderFiles),
    capacity: buildDynamoDbCapacity(tenderFiles, tender!.activationDate),
    province: buildDynamoDbProvince(tenderFiles),
  };
};
