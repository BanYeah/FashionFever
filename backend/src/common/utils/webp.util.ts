import sharp from 'sharp';

export class WebPUtil {
  static async convertToWebP(
    file: Express.Multer.File,
    quality: number = 0.8,
  ): Promise<Express.Multer.File> {
    if (file.mimetype === 'image/webp') return file;

    // WebP로 변환 및 압축
    const webpBuffer = await sharp(file.buffer)
      .webp({ quality: Math.round(quality * 100) })
      .toBuffer();

    // 기존 파일명에서 확장자 제거 후 .webp 붙이기
    const lastDotIndex = file.originalname.lastIndexOf('.');
    const fileNameWithoutExt =
      lastDotIndex !== -1
        ? file.originalname.substring(0, lastDotIndex)
        : file.originalname;

    const newFileName = `${fileNameWithoutExt}.webp`;

    // Express.Multer.File 형식으로 반환
    return {
      ...file, // 필드명(fieldname), 인코딩 등 기존 정보 유지
      originalname: newFileName,
      mimetype: 'image/webp',
      buffer: webpBuffer,
      size: webpBuffer.length,
    };
  }
}
