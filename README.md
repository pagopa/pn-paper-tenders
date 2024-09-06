# pn-paper-tenders

This repository is designed to manage tenders data through a structured process that ensures consistency and validation of data before it is loaded into DynamoDB.

## Overview
The architecture involves loading CSV files (with structures defined) into this repository (pn-paper-tenders) via Pull Requests (PR). When a PR is created, a dedicated CodeBuild process is triggered to verify the validity of the newly added tender data. If all checks pass successfully, an artifact is generated and stored in the CI bucket. This artifact consists of JSON files containing the records for DynamoDB tables.

Once the output has been generated, the `/scripts/tender_dynamo_db_load_batch` can be used to fetch the generated output from the relevant commit and load it into the DynamoDB tables of the target environment.


## Naming conventions
- **Tender directory name:** YYYYMMDD (e.g., 20240823)
- **CSV file names:**
  - `Tender.csv`
  - `TenderCosts.csv`
  - `Geokey_v1.csv`
  - `DeliveryDriver.csv`
- **Subsequent geokey versions:**
  - `Geokey_v2.csv`, `Geokey_vN.csv`, etc.

## Add a new tender
To add a new tender, follow these steps:

1. Create a directory inside the specific environment directory (dev, prod, etc.), named after the activation date of the tender (e.g., 20240823).
2. Place the CSV files in this new directory, ensuring the file structure matches the following:
  ```
  <tender_dir>
  ├─ Tender.csv
  ├─ TenderCosts.csv
  ├─ Geokey_v1.csv
  └─ DeliveryDriver.csv
  ```
3. When a PR is created, CodeBuild will perform the following checks:
    - File name conventions.
    - File structure validity.

    If all checks pass, CodeBuild generates a ZIP file containing the tender data in JSON format. The PR will only be approved if these checks succeed.

## Update a Geokey for an Existing Tender
To update the Geokey for an existing tender, add a new Geokey file to the tender directory following the naming convention Geokey_vN.csv (where N is the version number). Each update should only include the changes to be applied, along with the activation timestamp, without duplicating the entire updated Geokey table.

Example tender directory structure:
```
dev
└─ 20240823
   ├─ Tender.csv
   ├─ TenderCosts.csv
   ├─ DeliveryDriver.csv
   ├─ Geokey_v1.csv
   ├─ Geokey_v2.csv
   └─ Geokey_v3.csv
...
prod
└─ 20240823
   ├── Tender.csv
   ├── TenderCosts.csv
   ├── DeliveryDriver.csv
   ├── Geokey_v1.csv
   ├── Geokey_v2.csv
   └── Geokey_v3.csv
```

## CodeBuild output
Upon successful validation, CodeBuild generates a ZIP file containing JSON data for each environment in DynamoDB format. The ZIP file follows this structure:

```
dev
├─ <tender0>
│  ├─ pn-PaperChannelTender.json
│  ├─ pn-PaperChannelCost.json
│  ├─ pn-PaperChannelGeokey.json
│  └─ pn-PaperChannelDeliveryDrivers.json
├─ <tender1>
│  ...
└─ <tenderN>
test
uat
hotfix
prod
```
If multiple versions of Geokey are present, they are combined into a single JSON file during the CodeBuild process.

Each JSON file follows the naming format `<TABLE_NAME>.json`. Including the table name in the file name provides a standardized format, avoiding the need for mapping at various points in the process.

