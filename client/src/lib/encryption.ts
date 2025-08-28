import { EncryptionResult } from "@/types/notes";

export class EncryptionService {
  private static textEncoder = new TextEncoder();
  private static textDecoder = new TextDecoder();

  static async generateSalt(): Promise<Uint8Array> {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const passwordBuffer = this.textEncoder.encode(password);
    const importedKey = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      importedKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  static async encrypt(text: string, password: string): Promise<EncryptionResult> {
    try {
      const salt = await this.generateSalt();
      const key = await this.deriveKey(password, salt);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const textBuffer = this.textEncoder.encode(text);

      const cipherBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        textBuffer
      );

      return {
        cipherText: Array.from(new Uint8Array(cipherBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(''),
        iv: Array.from(iv)
          .map(b => b.toString(16).padStart(2, '0'))
          .join(''),
        salt: Array.from(salt)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      };
    } catch (error) {
      throw new Error('Encryption failed: ' + (error as Error).message);
    }
  }

  static async decrypt(encryptedData: EncryptionResult, password: string): Promise<string> {
    try {
      const salt = new Uint8Array(
        encryptedData.salt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );
      const iv = new Uint8Array(
        encryptedData.iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );
      const cipherText = new Uint8Array(
        encryptedData.cipherText.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );

      const key = await this.deriveKey(password, salt);
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        cipherText
      );

      return this.textDecoder.decode(decryptedBuffer);
    } catch (error) {
      throw new Error('Decryption failed: Invalid password or corrupted data');
    }
  }
}
