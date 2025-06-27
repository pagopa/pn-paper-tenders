import * as path from 'path';
import {
  tenderPattern,
  tenderCostsPattern,
  geokeyFileVersionPattern,
  deliveryDriverPattern,
  tenderNamePattern,
  lastDirPattern,
  capacityFileVersionPattern,
  provincePattern,
} from '../../utils/regex';
import { EnvTendersFiles, TenderFiles } from '../../types/tenders-files-types';
import { Envs, RequiredTenderFiles } from '../../utils/enum';
import { existPath, isDir, readDir } from '../../utils/file';

/**
 * List of required dirs that must be present in root directory.
 */
const rootDirs = Object.values(Envs) as string[];

/**
 * List of required files that must be present in each tender directory.
 */
const requiredFiles = Object.values(RequiredTenderFiles) as string[];

/**
 * Constructs the Geokey version file name based on the version number.
 *
 * @param {number} version - The version number of the Geokey file.
 * @returns {string} The constructed Geokey version file name.
 */
const buildGeokeyVersion = (version: number): string =>
  `Geokey_v${version}.csv`;

/**
 * Constructs the Geokey version file name based on the version number.
 *
 * @param {number} version - The version number of the Geokey file.
 * @returns {string} The constructed Geokey version file name.
 */
const buildCapacityVersion = (version: number): string =>
  `Capacity_v${version}.csv`;

/**
 * Builds an object representing the paths to tender-related CSV files
 * found in the specified directory.
 *
 * @param {string} dir - The directory containing the CSV files.
 * @param {string[]} files - The list of file names in the directory.
 * @returns {TenderFiles} An object containing paths to the tender-related CSV files.
 */
const buildTenderFiles = (dir: string, files: string[]): TenderFiles =>
  files
    .map((csv): [string, string] => [csv, path.join(dir, csv)])
    .reduce(
      (tenderFiles, [csv, csvPath]) => {
        switch (true) {
          case tenderPattern.test(csv):
            tenderFiles.tenderCsvPath = csvPath;
            break;
          case tenderCostsPattern.test(csv):
            tenderFiles.tenderCostsCsvPath = csvPath;
            break;
          case deliveryDriverPattern.test(csv):
            tenderFiles.deliveryDriverCsvPath = csvPath;
            break;
          case geokeyFileVersionPattern.test(csv):
            tenderFiles.geokeysCsvPaths!.push(csvPath);
            break;
          case capacityFileVersionPattern.test(csv):
            tenderFiles.capacityCsvPaths!.push(csvPath);
            break;
          case provincePattern.test(csv):
            tenderFiles.provincesCsvPath = csvPath;
        }
        return tenderFiles;
      },
      {
        geokeysCsvPaths: [],
        capacityCsvPaths: [],
        tenderDirPath: dir,
        tenderId: dir.match(lastDirPattern)![0],
      } as Partial<TenderFiles>
    ) as TenderFiles;

/**
 * Compares two Geokey versioned file names.
 * Extracts the version number from each file name using a regex pattern and
 * compares them as integers.
 *
 * @param {string} a - The first file name to compare.
 * @param {string} b - The second file name to compare.
 * @returns {number} - A negative number if `a` should come before `b`,
 *                     zero if they are equal,
 *                     or a positive number if `a` should come after `b`.
 */
const compareGeokeyVersions = (a: string, b: string) => {
  const matchA = a.match(geokeyFileVersionPattern);
  const matchB = b.match(geokeyFileVersionPattern);
  return compareVersions(matchA, matchB);
};

const compareCapacityVersions = (a: string, b: string) => {
  const matchA = a.match(capacityFileVersionPattern);
  const matchB = b.match(capacityFileVersionPattern);
  return compareVersions(matchA, matchB);
};

const compareVersions = (matchA: RegExpMatchArray | null, matchB: RegExpMatchArray | null) => {
  if (matchA && matchB) {
    const versionA = parseInt(matchA[1]!, 10);
    const versionB = parseInt(matchB[1]!, 10);
    return versionA - versionB;
  } else {
    return 0;
  }
};

/**
 * Validates the sequence of Geokey version files in the provided list of files.
 * Ensures that the versions start from v2 and increment consecutively.
 *
 * @param {string[]} files - The list of files to check.
 */
export const checkGeokeyVersions = (files: string[]): void => {
  files
    .filter((file) => geokeyFileVersionPattern.test(file))
    .sort(compareGeokeyVersions)
    .forEach((value, index) => {
      const versionIndex = index + 1;
      const buildedGeokey = buildGeokeyVersion(versionIndex);
      if (value !== buildedGeokey) {
        throw new Error(
          `Expected Geokey version ${buildedGeokey} found ${value}`
        );
      }
    });
};

/**
 * Validates the sequence of Geokey version files in the provided list of files.
 * Ensures that the versions start from v2 and increment consecutively.
 *
 * @param {string[]} files - The list of files to check.
 */
export const checkCapacityVersions = (files: string[]): void => {
  files
    .filter((file) => capacityFileVersionPattern.test(file))
    .sort(compareCapacityVersions)
    .forEach((value, index) => {
      const versionIndex = index + 1;
      const buildedCapacity = buildCapacityVersion(versionIndex);
      if (value !== buildedCapacity) {
        throw new Error(
          `Expected Capacity version ${buildedCapacity} found ${value}`
        );
      }
    });
};

/**
 * Checks the files in the provided directory for the required tender files
 * and the correct sequence of Geokey version files.
 *
 * @param {string} dir - The directory to check.
 * @returns {TenderFiles} An object containing paths to the validated tender files.
 * @throws {Error} If a required file is missing or if there are untracked files.
 */
export const checkTenderFiles = (dir: string): TenderFiles => {
  const files = readDir(dir).filter((file) => file.endsWith('.csv'));

  // Check for the presence of not required files
  const notRequiredCsv = files
    .filter((file) => !requiredFiles.includes(file))
    .filter((file) => !geokeyFileVersionPattern.test(file))
    .filter((file) => !capacityFileVersionPattern.test(file));

  if (notRequiredCsv.length > 0) {
    throw new Error(`Not required CSV files: ${notRequiredCsv.join(', ')}`);
  }

  // Check for the presence of required files
  requiredFiles.forEach((requiredFile) => {
    if (!files.includes(requiredFile)) {
      throw new Error(
        `The file ${requiredFile} is missing in directory ${dir}`
      );
    }
  });

  checkGeokeyVersions(files);
  checkCapacityVersions(files)

  return buildTenderFiles(dir, files);
};

/**
 * Validates the structure of directories and files within a tender directory.
 * Ensures that each subdirectory contains the required tender files and that
 * the Geokey version files are present in the correct sequence.
 *
 * @param {string} dirPath - The env directory path to validate.
 * @returns {TenderFiles[]} An array of `TenderFiles` objects for each validated
 * tender directory.
 * @throws {Error} If the directory does not exist or is improperly structured.
 */
export const validateTenders = (dirPath: string): TenderFiles[] => {
  if (!existPath(dirPath)) {
    throw new Error(`The directory ${dirPath} does not exist.`);
  }

  // Read subdirectories
  const subDirs = readDir(dirPath).filter((subDir) => {
    const subDirPath = path.join(dirPath, subDir);
    return isDir(subDirPath) && tenderNamePattern.test(subDir);
  });

  // Check each valid subdirectory
  const tenderFiles = subDirs
    .map((subDir) => path.join(dirPath, subDir))
    .map((subDirPath) => checkTenderFiles(subDirPath));

  console.log(`${dirPath} structure is valid.`);

  return tenderFiles;
};

/**
 * Validates the structure of directories and files within a
 * root pn-paper-tenders project directory.
 * Ensures that each environment subdirectory contains valid tender directories.
 *
 * @param {string} dirPath - The root directory to validate.
 * @returns {EnvTendersFiles} An object containing validated files for each environment.
 * @throws {Error} If the root directory or any required environment directory is missing.
 */
export const validateRootDir = (dirPath: string): EnvTendersFiles => {
  if (!existPath(dirPath)) {
    throw new Error(`The directory ${dirPath} does not exist.`);
  }

  // Read subdirectories
  const subDirs = readDir(dirPath).filter((subDir) => {
    const subDirPath = path.join(dirPath, subDir);
    return isDir(subDirPath);
  });

  // Check for the presence of required env dirs
  rootDirs.forEach((envDir) => {
    if (!subDirs.includes(envDir)) {
      throw new Error(`The env directory ${envDir} is missing in ${dirPath}`);
    }
  });

  // Construct EnvTendersFiles foreach env
  const envTendersFiles: Partial<EnvTendersFiles> = rootDirs
    .map((envDir): readonly [string, string] => [
      path.join(dirPath, envDir),
      envDir,
    ])
    .reduce((envTendersFile, [subDirPath, envDir]) => {
      envTendersFile[envDir as keyof EnvTendersFiles] =
        validateTenders(subDirPath);
      return envTendersFile;
    }, {} as Partial<EnvTendersFiles>);

  console.log('The project structure is valid.');
  return envTendersFiles as EnvTendersFiles;
};
