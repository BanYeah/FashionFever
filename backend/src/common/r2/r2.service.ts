import {
  Injectable,
  BadRequestException, // 400
  InternalServerErrorException, // 500
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class R2Service {
  private readonly s3Client: S3Client;
  private readonly bucketName = process.env.R2_BUCKET_NAME;
  private readonly publicEndpoint = process.env.R2_PUBLIC_ENDPOINT;

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'untitled',
  ): Promise<string> {
    if (file.mimetype !== 'image/webp')
      throw new BadRequestException('WebP 형식의 이미지만 업로드할 수 있어요!');

    if (file.size > 1 * 1024 * 1024)
      throw new BadRequestException('이미지 크기는 1MB를 초과할 수 없어요!');

    const fileName = `${folder}/${Date.now()}-${uuidv4()}.webp`;
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      await this.s3Client.send(command);
      return `${this.publicEndpoint}/${fileName}`;
    } catch (error) {
      throw new InternalServerErrorException(
        '파일 업로드 중 오류가 발생했어요!',
      );
    }
  }
}
