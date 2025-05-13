#! /bin/bash

AWS_URL_ENDPOINT=http://localhost:4566
AWS_S3_BUCKET=tender-bucket

ZIP_FILE=./resources/tender.zip

### Make S3 Bucket ###
echo "Creating S3 bucket: < ${AWS_S3_BUCKET} >"
aws s3 mb s3://${AWS_S3_BUCKET} --endpoint-url ${AWS_URL_ENDPOINT}

### Put File ###
echo "Uploading file to S3: ${ZIP_FILE}"
aws s3 cp ${ZIP_FILE} s3://${AWS_S3_BUCKET} --endpoint-url ${AWS_URL_ENDPOINT}

### PaperChannelCost Create DynamoDB Tables
echo "Creating PaperChannelCost table"
aws --profile default --region eu-south-1 --endpoint-url=${AWS_URL_ENDPOINT} \
    dynamodb create-table \
    --table-name pn-PaperChannelCost \
    --attribute-definitions \
      AttributeName=tenderId,AttributeType=S \
      AttributeName=productLotZone,AttributeType=S \
    --key-schema \
      AttributeName=tenderId,KeyType=HASH \
      AttributeName=productLotZone,KeyType=RANGE \
    --provisioned-throughput \
      ReadCapacityUnits=5,WriteCapacityUnits=5 \
      || true

### PaperChannelGeokey Create DynamoDB Tables
echo "Creating PaperChannelGeokey table"
aws --profile default --region eu-south-1 --endpoint-url=${AWS_URL_ENDPOINT} \
    dynamodb create-table \
    --table-name pn-PaperChannelGeokey \
    --attribute-definitions \
      AttributeName=tenderProductGeokey,AttributeType=S \
      AttributeName=activationDate,AttributeType=S \
    --key-schema \
      AttributeName=tenderProductGeokey,KeyType=HASH \
      AttributeName=activationDate,KeyType=RANGE \
    --provisioned-throughput \
      ReadCapacityUnits=5,WriteCapacityUnits=5 \
      || true

### PaperChannelTender Create DynamoDB Tables
echo "Creating PaperChannelTender table"
aws --profile default --region eu-south-1 --endpoint-url=${AWS_URL_ENDPOINT} \
    dynamodb create-table \
    --table-name pn-PaperChannelTender \
    --attribute-definitions \
      AttributeName=tenderId,AttributeType=S \
      AttributeName=activationDate,AttributeType=S \
    --key-schema \
      AttributeName=tenderId,KeyType=HASH \
      AttributeName=activationDate,KeyType=RANGE \
    --provisioned-throughput \
      ReadCapacityUnits=5,WriteCapacityUnits=5 \
      || true

### Create PaperChannelDeliveryDriver DynamoDB Tables
echo "Creating PaperChannelDeliveryDriver table"
aws --profile default --region eu-south-1 --endpoint-url=${AWS_URL_ENDPOINT} \
    dynamodb create-table \
    --table-name pn-PaperChannelDeliveryDriver \
    --attribute-definitions \
      AttributeName=deliveryDriverId,AttributeType=S \
    --key-schema \
      AttributeName=deliveryDriverId,KeyType=HASH \
    --provisioned-throughput \
      ReadCapacityUnits=5,WriteCapacityUnits=5 \
      || true

### Create PaperDeliveryDriverCapacities DynamoDB Tables
echo "Creating PaperDeliveryDriverCapacities table"
aws --profile default --region eu-south-1 --endpoint-url=${AWS_URL_ENDPOINT} \
    dynamodb create-table \
    --table-name pn-PaperDeliveryDriverCapacities \
    --attribute-definitions \
      AttributeName=pk,AttributeType=S \
      AttributeName=activationDateFrom,AttributeType=S \
    --key-schema \
      AttributeName=pk,KeyType=HASH \
      AttributeName=activationDateFrom,KeyType=RANGE \
    --provisioned-throughput \
      ReadCapacityUnits=5,WriteCapacityUnits=5 \
      || true