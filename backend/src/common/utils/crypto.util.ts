import * as crypto from 'crypto';

export class CryptoUtil {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12;

  private static ENCRYPTION_KEY: Buffer | null = null;
  private static get key(): Buffer {
    if (this.ENCRYPTION_KEY) return this.ENCRYPTION_KEY;

    const KEY = process.env.ENCRYPTION_KEY;
    if (!KEY || KEY.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 characters long!');
    }

    this.ENCRYPTION_KEY = Buffer.from(KEY);
    return this.ENCRYPTION_KEY;
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
    try {
      const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
      if (!ivHex || !authTagHex || !encrypted) throw new Error('Invalid format of encrypted text');

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.ALGORITHM, this.key, iv);

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (e) {
      throw new Error('Decryption failed');
    }
  }
}
