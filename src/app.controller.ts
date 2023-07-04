import { Controller, Get, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { S3Service } from './s3/s3.service';
import * as sharp from 'sharp'
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as AWS from 'aws-sdk';


@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly S3Service: S3Service,
    ) {
      AWS.config.update({
        accessKeyId: 'YOUR_AWS_ACCESS_KEY',
        secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY',
        region: 'YOUR_AWS_REGION',
      })
    }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/upscale')
  @UseInterceptors(FileInterceptor('file'))
  public async upscaleImage(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response
  ) {
    const {width, height} = await sharp(file.buffer).metadata()
    const resizeImage = await sharp(file.buffer)
      .resize(width * 2, height * 2, {
        kernel: "cubic",
      })
      .toBuffer();
    console.log(resizeImage)
    res.setHeader('Content-Type', 'image/png'); // Replace 'image/jpeg' with the correct content type for your image

    // Send the buffer as the response
    res.send(resizeImage);
  }

  @Post('/upload/url')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileToS3(@UploadedFile() file: Express.Multer.File): Promise<string> {
    const bucketName = 'your-bucket-name'; // Replace with your actual bucket name

    return this.S3Service.uploadFile(file, bucketName);
  }

}
