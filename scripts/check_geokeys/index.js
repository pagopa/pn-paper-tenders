import axios from 'axios';
import fs from 'fs';
import { parse } from 'csv-parse';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { DateTime } from 'luxon';

// Validate command-line arguments
if (process.argv.length < 6) {
  console.error(
    '\nUsage: node index.js <currentDateTime> <pnAddressManagerCapUrl> <pnAddressManagerCountryUrl> <geokeyCsvFile>'
  );
  console.error(
    '\nExample: node index.js "2024-09-09T00:00:00.000Z" "https://raw.githubusercontent.com/pagopa/xxx/confinfo/dynamodb/pn-addressManager-Cap.json" "https://raw.githubusercontent.com/pagopa/xxx/confinfo/dynamodb/pn-addressManager-Country.json" "../../<env>/<tenderId>/Geokey_v1.csv"'
  );
  process.exit(1); // Exit if arguments are missing
}

// Get parameters from command-line arguments
const currentDateTime = process.argv[2];
const pnAddressManagerCapUrl = process.argv[3];
const pnAddressManagerCountryUrl = process.argv[4];
const geokeyCsvFile = process.argv[5];

// Read and parse JSONL content from response
const readJsonl = async (inputRes) => {
  const data = [];
  for (const line of inputRes.data.split('\n')) {
    if (line.trim()) {
      const marshaledItem = JSON.parse(line);
      const unmarshaledItem = unmarshall(marshaledItem);
      data.push(unmarshaledItem);
    }
  }
  return data;
};

// Filter records where the 'startValidity' is before the provided timestamp
const filterValidRecords = (dataList, timestamp, attributeName) => {
  const valid = new Set();
  for (const entry of dataList) {
    const startValidity = entry['startValidity'];
    if (startValidity) {
      const startValidityDate = DateTime.fromISO(startValidity, {
        zone: 'utc',
      });
      if (timestamp < startValidityDate) {
        continue; // Skip if the timestamp is earlier than the validity start date
      }
    }
    valid.add(entry[attributeName]);
  }
  return valid;
};

// Read CSV file and collect values from the specified column
const readCsv = (filePath, columnName) => {
  return new Promise((resolve, reject) => {
    const values = new Set();
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ';', columns: true }))
      .on('data', (row) => {
        const value = row[columnName];
        if (value) values.add(value);
      })
      .on('end', () => resolve(values))
      .on('error', reject);
  });
};

// Compare two sets and return items unique to each set
const compareSets = (set1, set2) => {
  const onlyInSet1 = new Set([...set1].filter((item) => !set2.has(item)));
  const onlyInSet2 = new Set([...set2].filter((item) => !set1.has(item)));
  return { onlyInSet1, onlyInSet2 };
};

// Main function that orchestrates the entire process
const main = async () => {
  try {
    // Fetch DynamoDB data from URLs
    const [capResponse, countryResponse] = await Promise.all([
      axios.get(pnAddressManagerCapUrl),
      axios.get(pnAddressManagerCountryUrl),
    ]);

    // Deserialize JSONL data from responses
    const capData = await readJsonl(capResponse);
    const countryData = await readJsonl(countryResponse);

    const timestamp = DateTime.fromISO(currentDateTime, { zone: 'utc' });

    // Filter valid 'cap' and 'country' records based on the current timestamp
    const validCaps = filterValidRecords(capData, timestamp, 'cap');
    const validCountries = filterValidRecords(
      countryData,
      timestamp,
      'country'
    );

    // Combine valid caps and countries into one set
    const validGeokeys = new Set([...validCaps, ...validCountries]);

    // Read CSV file and get the set of geokeys
    const geokeyFileSet = await readCsv(geokeyCsvFile, 'geokey');

    // Compare sets and identify differences
    const { onlyInSet1: onlyValid, onlyInSet2: onlyGeokeyFile } = compareSets(
      validGeokeys,
      geokeyFileSet
    );

    // Log differences
    console.log('Found only in pn-addressManager:');
    console.log([...onlyValid]);

    console.log(`Found only in ${geokeyCsvFile}:`);
    console.log([...onlyGeokeyFile]);
  } catch (error) {
    console.error('Error during execution:', error);
  }
};

main();
