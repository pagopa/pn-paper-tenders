const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;

const { makeDirSync, writeSync } = require('../utils/IOUtils');

class AwsS3Client {
  constructor(credentials, isLocal) {
    const conf = {
      region: 'eu-central-1',
      credentials: credentials,
    };

    if (isLocal) {
      conf.endpoint = 'http://localhost:4566';
      conf.sslEnabled = false;
      conf.forcePathStyle = true;
    }

    this._s3client = new S3Client(conf);
  }

  /**
   * Retrieve an object from a S3 bucket.
   *
   * @param bucket    S3 bucket from which retrieve the object
   * @param key       the key that identifies the object on S3
   *
   * @return S3 object
   * */
  async getObject(bucket, key) {
    return this._s3client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  }

  /**
   * Retrieve an object from a S3 bucket and download it locally.
   *
   * @param bucket            S3 bucket from which retrieve the object
   * @param key               the key that identifies the object on S3
   * @param downloadLocation  path on local file system in which save the file
   * @param fileName          object name to assign locally
   *
   * @return S3 object
   * */
  async downloadObject(bucket, key, downloadLocation, fileName) {
    const content = (await this.getObject(bucket, key)).Body;

    makeDirSync(downloadLocation);
    return fs.writeFile(downloadLocation + '/' + fileName, content);
  }
}

exports.AwsS3Client = AwsS3Client;
