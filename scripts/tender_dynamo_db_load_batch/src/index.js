const { parseArgs } = require('util');
const { extname, parse } = require("node:path");

const { AwsAuthClient} = require("./libs/AwsAuthClient");
const { AwsS3Client } = require("./libs/AwsS3Client");
const { AwsDynamoDBClient } = require("./libs/AwsDynamoDBClient");

const { templateArgs, templateOptions} = require("./config/arguments")

const { validate } = require('./utils/argumentsValidator')
const { unzip, readSync } = require('./utils/IOUtils');

const crypto = require('crypto');

const TMP_FOLDER = "./tmp"
const ARTIFACT_NAME = "tender.zip"

async function main() {

    console.time("tender-dynamo-db-load-batch");

    const processingUUID = crypto.randomUUID();
    const sourceLocation = `${TMP_FOLDER}/${processingUUID}`;

    console.info("Processing marker: ", processingUUID);

    const parsedArgs = parseArgs(templateOptions);

    if (!validate(templateArgs, parsedArgs)) process.exit(1);

    // Authenticate and configure AWS clients
    const awsAuthClient = new AwsAuthClient();
    const cicdTemporaryCredentials = await awsAuthClient.ssoCredentials(parsedArgs.values.cicdProfile, parsedArgs.values.local);
    const coreTemporaryCredentials = await awsAuthClient.ssoCredentials(parsedArgs.values.coreProfile, parsedArgs.values.local);

    const awsS3Client = new AwsS3Client(cicdTemporaryCredentials, parsedArgs.values.local);
    const awsDynamoDBClient = new AwsDynamoDBClient(coreTemporaryCredentials, parsedArgs.values.local);

    // Retrieve artifact from CI S3 and get local unzipped file paths
    await awsS3Client.downloadObject(
        parsedArgs.values.bucket,
        parsedArgs.values.artifact,
        sourceLocation,
        ARTIFACT_NAME
    );

    let filePaths = await unzipArtifact(
        parsedArgs.values.env,
        sourceLocation + "/" + ARTIFACT_NAME,
        sourceLocation
    );

    // Find max tender folder files when fullImport is disabled
    if (!parsedArgs.values.fullImport) {
        const maxTenderDir = parse(filePaths.sort().reverse()[0]).dir;
        filePaths = filePaths.filter(p => p.match(maxTenderDir));
    }

    // Write json entities to DynamoDB
    for (const p of filePaths) {
        await writeEntitiesToDynamoFromLocalFile(
            awsDynamoDBClient,
            sourceLocation + "/" + p
        );
    }

    console.timeEnd("tender-dynamo-db-load-batch");
}

/**
 * This method unzip the artifact provided in source path returning the content locations
 * within the local file system.
 *
 * @param env           environment folder to filter
 * @param source        S3 key in which the artifact is located
 * @param target        local path where to save compressed artifact
 *
 * @return a list of string representing the path of the extracted files
 * */
async function unzipArtifact(env, source, target) {
    const unzipCallback = (file) =>
        extname(file.path) === '.json' &&
        file.path.includes(env) &&
        !file.path.match(/^__MACOSX\//)

    return unzip(source, target, unzipCallback);
}

/**
 * This method reads the local files containing the entity to import in DynamoDB and write them to the database.
 *
 * @param awsDynamoDBClient   client for AWS DynamoDB interaction
 * @param source              path to local file system from which retrieve the json entity
 *
 * @return a list of string representing the path of the extracted files
 * */
async function writeEntitiesToDynamoFromLocalFile(awsDynamoDBClient, source) {
    const tableName = parse(source).name; // Get name without extension (aka Dynamo table name)
    console.log("Processing " + tableName);

    const jsonObjects = readSync(source)
        .trim()
        .split('\n')
        .map(json => JSON.parse(json));

    await awsDynamoDBClient.groupAndBatchWriteItems(tableName, jsonObjects)
}

main().then();