import {
  DynamoDBClient,
  DescribeTableCommand,
  BatchWriteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { fromSSO } from '@aws-sdk/credential-provider-sso';
import readline from 'readline';

const region = 'eu-south-1';

// Validate command-line arguments
if (process.argv.length < 3) {
  console.error('\nUsage: node index.js <sso_profile> [tenderId]');
  console.error('\nExample: node index.js "sso_pn-core-dev"');
  console.error('         node index.js "sso_pn-core-dev" "20250504"');
  process.exit(1);
}

const profileName = process.argv[2];
const tenderId = process.argv[3] || null;

if (profileName.toLowerCase().includes("prod")) {
  console.error('\nProduction DB! 😱');
  process.exit(1);
}

const tables = [
  'pn-PaperChannelTender',
  'pn-PaperChannelGeokey',
  'pn-PaperChannelCost',
  'pn-PaperDeliveryDriverCapacities',
  // If tenderId is not provided, include the delivery driver table
  ...(!tenderId ? ['pn-PaperChannelDeliveryDriver'] : []),
];

// Create the DynamoDB client using SSO credentials
const dynamoClient = new DynamoDBClient({
  credentials: fromSSO({ profile: profileName }),
  region,
});
const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);


const tenderCheck = async (profileName, tenderId) => {
  console.log(`Using SSO profile: ${profileName}`);
  
  if (tenderId) {
    console.log(`Using tenderId: ${tenderId}`);
    return;
  }

  console.log('No tenderId provided');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise((resolve) => {
    rl.question('⚠️  Are you sure you want to delete the entire database? (yes/no): ', resolve);
  });

  rl.close();

  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    console.log('Proceeding with full database deletion...');
  } else {
    console.log('Operation cancelled.');
    process.exit(0);
  }
};

// Retrieve the primary keys of a table
const getPrimaryKeys = async (tableName) => {
  const command = new DescribeTableCommand({ TableName: tableName });
  const response = await dynamoClient.send(command);
  const keySchema = response.Table.KeySchema;
  const keys = {};

  // Extract partition and sort keys (if any)
  keySchema.forEach((key) => {
    if (key.KeyType === 'HASH') {
      keys.partitionKey = key.AttributeName; // Partition key
    } else if (key.KeyType === 'RANGE') {
      keys.sortKey = key.AttributeName; // Sort key (if any)
    }
  });

  return keys;
};

// Delete all items from a table in batches, handling paginated results
const deleteAllItems = async (tableName) => {
  const primaryKeys = await getPrimaryKeys(tableName);
  let totalDeleted = 0;
  let lastEvaluatedKey = undefined;

  // Loop through paginated results until all items are deleted
  do {
    const scanParams = {
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
    };

    const scanCommand = new ScanCommand(scanParams);
    const scanResult = await dynamoDocClient.send(scanCommand);
    let items = scanResult.Items || [];

    // filter based on tenderId if provided
    if (tenderId) {
      items = items.filter((item) => {
        const partitionKeyValue = item[primaryKeys.partitionKey];
        return (typeof partitionKeyValue === 'string' && partitionKeyValue.startsWith(tenderId));
      });
    }

    if (items.length > 0) {
      // Split items into batches of 25 (max batch size for BatchWriteItem)
      const batches = [];
      for (let i = 0; i < items.length; i += 25) {
        batches.push(items.slice(i, i + 25));
      }

      // Process each batch
      for (const batch of batches) {
        const deleteRequests = batch.map((item) => {
          const keyToDelete = {
            [primaryKeys.partitionKey]: { S: item[primaryKeys.partitionKey] },
          };

          if (primaryKeys.sortKey) {
            keyToDelete[primaryKeys.sortKey] = { S: item[primaryKeys.sortKey] };
          }

          return {
            DeleteRequest: {
              Key: keyToDelete,
            },
          };
        });

        const batchParams = {
          RequestItems: {
            [tableName]: deleteRequests,
          },
        };

        const batchWriteCommand = new BatchWriteItemCommand(batchParams);
        await dynamoClient.send(batchWriteCommand);

        totalDeleted += deleteRequests.length;
      }
    }

    lastEvaluatedKey = scanResult.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  console.log(`Items deleted in ${tableName}: ${totalDeleted}`);
};

// Count the remaining items in the table
const countRemainingItems = async (tableName) => {
  const scanParams = {
    TableName: tableName,
    Select: 'COUNT',
  };

  const scanCommand = new ScanCommand(scanParams);
  const scanResult = await dynamoDocClient.send(scanCommand);
  const count = scanResult.Count;

  console.log(`Remaining items in ${tableName}: ${count}`);
};

const main = async () => {
  await tenderCheck(profileName, tenderId);
  for (const table of tables) {
    await deleteAllItems(table);
    await countRemainingItems(table);
  }
};

main();
