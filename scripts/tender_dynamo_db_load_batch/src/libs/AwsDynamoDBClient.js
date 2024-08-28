const { DynamoDBClient, BatchWriteItemCommand } = require("@aws-sdk/client-dynamodb");

class AwsDynamoDBClient {

    constructor(credentials, isLocal) {
        const conf = {
            region: 'eu-south-1',
            credentials: credentials
        };

        if (isLocal) {
            conf.endpoint = "http://localhost:4566";
            conf.sslEnabled = false;
        }

        this._dynamoClient = new DynamoDBClient(conf);
    }

    /**
     * Write multiple items into a DynamoDB table grouping them in batches of fixed size.
     * This method takes care about data partitioning.
     *
     * @param tableName name of DynamoDB table
     * @param items     dynamo notation items to be written into the table
     * @param batchSize size of each batch; default is 25
     * */
    async groupAndBatchWriteItems(tableName, items, batchSize = 25) {
        for (let i = 0; i < items.length; i = i + batchSize){
            const batch = items.slice(i, i + batchSize);
            await this.batchWriteItems(tableName, batch);
        }
    }

    /**
     * This method converts a batch of items into DynamoDB Requests and call a retryable writer.
     *
     * @param tableName name of DynamoDB table
     * @param batch     batch to be written into the table
     * */
    async batchWriteItems(tableName, batch) {
        console.info(`Writing a batch of size ${batch.length}`)

        const putRequests = [];

        batch.forEach(element => {
            putRequests.push({ // WriteRequest
                PutRequest: { // PutRequest
                    Item: element,
                },
            })
        });

        try {
            return await this.retryableBatchWriteItems(tableName, putRequests);
        }
        catch (error) {
            console.error("Error during BatchWriteItemCommand cause=", error);
            process.exit(1);
        }
    }

    /**
     * This method writes a set of Requests into the DynamoDB table.
     * In case of errors during write operation it retries using exponential backoff strategy
     * for a max of 8 retry
     *
     * @param tableName     name of DynamoDB table
     * @param requests      batch to be written into the table
     * @param retryCount    optional integer that indicates the current retry count
     *
     * @return              batch items write response
     * */
    async retryableBatchWriteItems(tableName, requests, retryCount = 0) {
        const retryWait = (ms) => new Promise((res) => setTimeout(res, ms));

        if (retryCount && retryCount > 8) throw new Error(`Retry count limit exceeded, current is: ${retryCount}`);

        const input = { // BatchWriteItemInput
            RequestItems: { // BatchWriteItemRequestMap // required
                [tableName] : requests,
            },
            ReturnConsumedCapacity: "TOTAL",
            ReturnItemCollectionMetrics: "SIZE"
        };

        const batchWriteResponse = await this._dynamoClient.send(new BatchWriteItemCommand(input));

        if (batchWriteResponse.UnprocessedItems && batchWriteResponse.UnprocessedItems.length > 0) {
            console.log(`Wait and retry unprocessed items for the ${retryCount} time`);

            await retryWait(2 ** retryCount * 10); // start with 10 ms waiting
            return this.retryableBatchWriteItems(tableName, batchWriteResponse.UnprocessedItems, retryCount + 1)
        }

        return batchWriteResponse;
    }
}

exports.AwsDynamoDBClient = AwsDynamoDBClient;