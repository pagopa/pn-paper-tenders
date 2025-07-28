import * as fs from 'fs';
import * as path from 'path';
import { DynamoDbTender } from '../lib/builder';
import { DynamoTables } from './enum';
import AdmZip from 'adm-zip';

/**
 * Reads the contents of a directory and returns a list of filenames.
 *
 * @param dirPath - The path of the directory to read.
 * @returns An array of filenames in the directory.
 */
export const readDir = (dirPath: string): string[] => fs.readdirSync(dirPath);

/**
 * Checks if the given path is a directory.
 *
 * @param dirPath - The path to check.
 * @returns `true` if the path is a directory, otherwise `false`.
 */
export const isDir = (dirPath: string): boolean =>
  fs.statSync(dirPath).isDirectory();

/**
 * Checks if the given path exists.
 *
 * @param path - The path to check.
 * @returns `true` if the path exists, otherwise `false`.
 */
export const existPath = (path: string): boolean => fs.existsSync(path);

/**
 * Creates a directory.
 *
 * @param dirPath - The path of the directory to create.
 */
export const createDir = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Deletes a directory and all of its contents.
 *
 * @param dirPath - The path of the directory to delete.
 */
export const deleteDir = (dirPath: string): void => {
  if (fs.existsSync(dirPath)) {
    // Rimuove la directory esistente e tutto il suo contenuto
    fs.rmSync(dirPath, { recursive: true });
  }
};

/**
 * Saves an array of objects to a file in JSON Lines format.
 *
 * @param filePath - The path of the file to save.
 * @param data - An array of objects to save in the file.
 */
export const saveJsonlToFile = (filePath: string, data: object[]): void => {
  // Estrai il percorso della directory dal filePath
  const dir = path.dirname(filePath);

  // Create directory if not exits
  createDir(dir);

  // Converti i dati in formato JSONL
  const jsonlData = data.map((item) => JSON.stringify(item)).join('\n');
  fs.writeFileSync(filePath, jsonlData, 'utf8');
};

/**
 * Saves a DynamoDB tender object and its associated data to JSON files.
 *
 * @param tender - The DynamoDB tender object to save.
 * @param tenderId - The identifier for the tender.
 * @param dir - The base directory where the files will be saved.
 */
export const writeDynamoDbTenderFile = (
  tender: DynamoDbTender,
  tenderId: string,
  dir: string
): void => {
  const baseDir = path.join(dir, tenderId);
  const tenderFilePath = path.join(baseDir, DynamoTables.TENDER + '.json');
  const costFilePath = path.join(baseDir, DynamoTables.COST + '.json');
  const geokeyFilePath = path.join(baseDir, DynamoTables.GEOKEY + '.json');
  const deliveryDriverFilePath = path.join(baseDir,DynamoTables.DELIVERY_DRIVER + '.json' );
  const capacityFilePath = path.join( baseDir, DynamoTables.CAPACITY + '.json');
  const provincesFilePath = path.join(baseDir, DynamoTables.PROVINCE + '.json');

  saveJsonlToFile(tenderFilePath, tender.tender);
  saveJsonlToFile(costFilePath, tender.tenderCosts);
  saveJsonlToFile(geokeyFilePath, tender.geokey);
  saveJsonlToFile(deliveryDriverFilePath, tender.deliveryDriver);
  saveJsonlToFile(capacityFilePath, tender.capacity);

  // il file Province.csv non deve essere fornito per forza in ogni gara
  if (tender.province) {
    saveJsonlToFile(provincesFilePath, tender.province);
  }

};

/**
 * Zips a directory and saves the zip file at the specified output path.
 *
 * @param sourceDir - The path of the directory to be zipped.
 * @param outputZipPath - The output path where the zip file will be saved.
 */
export const zipDir = async (
  sourceDir: string,
  outputZipPath: string
): Promise<void> => {
  // Create a new instance of AdmZip
  const zip = new AdmZip();

  // Add the entire directory to the zip
  zip.addLocalFolder(sourceDir);

  // Write the zip file to the specified output path
  await zip.writeZipPromise(outputZipPath);

  console.log(`Directory ${sourceDir} zipped successfully to ${outputZipPath}`);
};
