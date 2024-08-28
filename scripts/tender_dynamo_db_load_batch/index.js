const { parseArgs } = require('util');
const { extname, parse } = require("node:path");

const { AwsAuthClient} = require("./libs/AwsAuthClient");
const { AwsS3Client } = require("./libs/AwsS3Client");
const { AwsDynamoDBClient } = require("./libs/AwsDynamoDBClient");

const { templateArgs, templateOptions} = require("./config/arguments")

const { validate } = require('./utils/argumentsValidator')
const { unzip, readSync } = require('./utils/IOUtils');

const TMP_FOLDER = "./tmp"
const ARTIFACT_NAME = "tender.zip"

async function main() {

    console.time("tender-dynamo-db-load-batch");

    const processingUUID = crypto.randomUUID();
    const baseArtifactLocation = `${TMP_FOLDER}/${processingUUID}`;

    console.info("Processing marker: ", processingUUID);

    const parsedArgs = parseArgs(templateOptions);

    if (!validate(templateArgs, parsedArgs)) process.exit(1);

    const awsAuthClient = new AwsAuthClient();
    const cicdTemporaryCredentials = await awsAuthClient.ssoCredentials(parsedArgs.values.cicdProfile);
    const coreTemporaryCredentials = await awsAuthClient.ssoCredentials(parsedArgs.values.coreProfile);

    const awsS3Client = new AwsS3Client(cicdTemporaryCredentials, parsedArgs.values.local);
    const awsDynamoDBClient = new AwsDynamoDBClient(coreTemporaryCredentials, parsedArgs.values.local);

    // Retrieve artifact from CI S3 and get local unzipped file paths
    const filePaths = await retrieveAndUnzipArtifact(
        awsS3Client,
        parsedArgs.values.bucket,
        parsedArgs.values.artifact,
        baseArtifactLocation
    );

    // Write json entities to DynamoDB
    for (const p of filePaths) {
        await writeEntitiesToDynamoFromLocalFile(
            awsDynamoDBClient,
            baseArtifactLocation + "/" + p
        );
    }

    console.timeEnd("tender-dynamo-db-load-batch");
}

/**
 * This method retrieve the zip artifact from provided S3 bucket and unzip it returning the content locations
 * within the local file system.
 *
 * @param awsS3Client               client for AWS S3 interaction
 * @param bucket                    S3 bucket from which retrieve the artifact
 * @param artifactLocation          S3 key in which the artifact is located
 * @param baseArtifactLocation      local path where to save compressed artifact
 *
 * @return a list of string representing the path of the extracted files
 * */
async function retrieveAndUnzipArtifact(awsS3Client, bucket, artifactLocation, baseArtifactLocation) {
    await awsS3Client.downloadObject(bucket, artifactLocation, baseArtifactLocation, ARTIFACT_NAME);

    return unzip(
        baseArtifactLocation + "/" + ARTIFACT_NAME,
        baseArtifactLocation,
        file => extname(file.path) === '.json' && !file.path.match(/^__MACOSX\//)
    );
}

/**
 * This method reads the local files containing the entity to import in DynamoDB and write them to the database.
 *
 * @param awsDynamoDBClient   client for AWS DynamoDB interaction
 * @param location            path to local file system from which retrieve the json entity
 *
 * @return a list of string representing the path of the extracted files
 * */
async function writeEntitiesToDynamoFromLocalFile(awsDynamoDBClient, location) {
    const tableName = parse(location).name; // Get name without extension (aka Dynamo table name)
    console.log("Processing " + tableName);

    const jsonObjects = readSync(location)
        .trim()
        .split('\n')
        .map(json => JSON.parse(json));

    await awsDynamoDBClient.groupAndBatchWriteItems(tableName, jsonObjects)
}

main().then();