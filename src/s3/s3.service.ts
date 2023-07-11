import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name)
  private readonly s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      region: 'ap-southeast-1',
      accessKeyId: process.env.S3_CLIENT_ID,
      secretAccessKey: process.env.S3_CLIENT_SECRET,
    });
  }

  async uploadFile(file: Express.Multer.File, bucketName: string): Promise<string> {
    try {
    const uploadParams = {
      Bucket: bucketName,
      Key: file.originalname,
      Body: file.buffer,
      ACL: 'bucket-owner-read', // Set the ACL to make the uploaded file publicly accessible
    };

    const result = await this.s3.upload(uploadParams).promise();

    return result.Location;
  } catch (error) {
    this.logger.error(`uploadFile error with %s`, error.stack)
    throw InternalServerErrorException
  }
  }
}