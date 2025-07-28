/**
 * Regular expression pattern to validate tender names in the format YYYYMMDD.
 * Matches exactly 8 digits representing a date.
 * Example: 20230829
 */
export const tenderNamePattern = /^\d{8}$/;

/**
 * Regular expression pattern to match files ending with "Tender.csv".
 * Example: ./Tender.csv, ./test/Tender.csv
 */
export const tenderPattern = /.*Tender\.csv$/;

/**
 * Regular expression pattern to match files ending with "TenderCosts.csv".
 * Example: ./TenderCosts.csv, ./test/TenderCosts.csv
 */
export const tenderCostsPattern = /.*TenderCosts\.csv$/;

/**
 * Regular expression pattern to match files ending with "DeliveryDriver.csv".
 * Example: MyDeliveryDriver.csv, AnotherDeliveryDriver.csv
 */
export const deliveryDriverPattern = /.*DeliveryDriver\.csv$/;


/**
 * Regular expression pattern to match valid Geokey version files.
 * Matches files named "Geokey_v2.csv", "Geokey_v3.csv", etc.
 * Example: Geokey_v2.csv, Geokey_v3.csv
 */
export const geokeyFileVersionPattern = /.*Geokey_v(\d*)\.csv$/;

/**
 * Regular expression pattern to match valid Capacity version files.
 * Matches files named "Capacity_v2.csv", "Capacity_v3.csv", etc.
 * Example: Capacity_v2.csv, Capacity_v3.csv
 */
export const capacityFileVersionPattern = /.*Capacity_v(\d*)\.csv$/;


/**
 * Regular expression pattern to match province files.
 * Matches files named "Province.csv".
 * Example: Province.csv
 */
export const provincePattern = /.*Province\.csv$/;

/**
 * Regular expression pattern to match range columns in the format "range_x_y".
 * Captures the numbers x and y in the column name.
 * Example: range_1_10, range_5_15
 */
export const rangeColumnPattern = /^range_(\d+)_(\d+)$/;

/**
 * Regular expression pattern to match the last directory name in a path.
 * Matches the final component of a path, ignoring slashes.
 * Example: In the path "/home/user/project", it matches "project".
 */
// eslint-disable-next-line no-useless-escape
export const lastDirPattern = /[^\\\/]+$/;
