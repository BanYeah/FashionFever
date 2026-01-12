import * as crypto from 'crypto';

export class CryptoUtil {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12;

  private static get key(): Buffer {
    const KEY = process.env.ENCRYPTION_KEY;
    if (!KEY || KEY.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 characters long!');
    }
    return Buffer.from(KEY);
  }

  static encrypt(text: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // IV + 인증태그 + 암호문을 합쳐서 저장 (복호화 시 모두 필요)
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  static decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.key, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
