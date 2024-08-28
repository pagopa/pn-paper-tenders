#! /bin/bash -e

AWS_URL_ENDPOINT=http://localhost:4566
AWS_S3_BUCKET=test-bucket

ZIP_FILE=./resources/test.zip

### Make S3 Bucket ###
echo "Creating S3 bucket: < ${AWS_S3_BUCKET} >"
aws s3 mb s3://${AWS_S3_BUCKET} --endpoint-url ${AWS_URL_ENDPOINT}

### Put File ###
echo "Uploading file to S3: ${ZIP_FILE}"
aws s3 cp ${ZIP_FILE} s3://${AWS_S3_BUCKET} --endpoint-url ${AWS_URL_ENDPOINT}

### Create DynamoDB Tables
aws --profile default --region eu-south-1 --endpoint-url=${AWS_URL_ENDPOINT} \
    dynamodb create-table \
    --table-name pn-PaperCost \
    --attribute-definitions \
      AttributeName=driverCode,AttributeType=S \
      AttributeName=uuidCode,AttributeType=S \
    --key-schema \
      AttributeName=driverCode,KeyType=HASH \
      AttributeName=uuidCode,KeyType=RANGE \
    --provisioned-throughput \
      ReadCapacityUnits=5,WriteCapacityUnits=5