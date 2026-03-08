import {
  Injectable,
  BadRequestException, // 400
  InternalServerErrorException, // 500
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { WebPUtil } from '../utils/webp.util';

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
    if (file.size > 1 * 1024 * 1024)
      throw new BadRequestException('이미지 크기는 1MB를 초과할 수 없어요!');

    const convertedFile = await WebPUtil.convertToWebP(file).catch(() => {
      throw new BadRequestException(
        '이미지를 WebP 형식으로 변환하는데 실패했어요.',
      );
    });

    const fileName = `${folder}/${Date.now()}-${uuidv4()}.webp`;
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: convertedFile.buffer,
        ContentType: convertedFile.mimetype,
        // 브라우저 1일(86400), CDN 14일(1209600) 캐싱
        CacheControl: 'public, max-age=86400, s-maxage=1209600',
      });
      await this.s3Client.send(command);
      return `${this.publicEndpoint}/${fileName}`;
    } catch (error) {
      throw new InternalServerErrorException(
        '파일 업로드 중 오류가 발생했어요!',
      );
    }
  }

  async deleteImages(fileUrls: string[]): Promise<void> {
    if (fileUrls.length === 0) return;

    const objectsToDelete = fileUrls.map((url) => ({
      Key: decodeURIComponent(url.replace(`${this.publicEndpoint}/`, '')),
    }));
    const errors: any[] = [];

    const chunkSize = 1000;
    for (let i = 0; i < objectsToDelete.length; i += chunkSize) {
      const chunk = objectsToDelete.slice(i, i + chunkSize);

      try {
        const command = new DeleteObjectsCommand({
          Bucket: this.bucketName,
          Delete: {
            Objects: chunk,
            Quiet: true, // 성공한 항목은 응답에 포함하지 않음
          },
        });
        await this.s3Client.send(command);
      } catch (error) {
        console.error(`[S3_DELETE_ERROR] Chunk starting at ${i} failed`, error);
        errors.push({ index: i, error });
      }
    }

    if (errors.length > 0) {
      throw new InternalServerErrorException(
        `이미지 일괄 삭제 중 일부(${errors.length}개 청크) 오류가 발생했어요!`,
      );
    }
  }
}
