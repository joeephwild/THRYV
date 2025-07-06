import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a password with a hash
 * @param password - Plain text password
 * @param hashedPassword - Hashed password
 * @returns True if password matches hash
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Encrypt sensitive data
 * @param data - Data to encrypt
 * @returns Encrypted data
 */
export const encryptData = (data: string): { encryptedData: string; iv: string } => {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
  };
};

/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted data
 * @param iv - Initialization vector used for encryption
 * @returns Decrypted data
 */
export const decryptData = (encryptedData: string, iv: string): string => {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

/**
 * Generate a random encryption key
 * @returns Hex string of random bytes
 */
export const generateEncryptionKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash sensitive data (one-way)
 * @param data - Data to hash
 * @returns Hashed data
 */
export const hashData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate a secure random string
 * @param length - Length of the string
 * @returns Random string
 */
export const generateRandomString = (length = 32): string => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

/**
 * Mask sensitive data (e.g., credit card numbers)
 * @param data - Data to mask
 * @param visibleChars - Number of characters to leave visible at the end
 * @returns Masked data
 */
export const maskSensitiveData = (data: string, visibleChars = 4): string => {
  if (!data || data.length <= visibleChars) {
    return data;
  }
  
  const maskedPart = '*'.repeat(data.length - visibleChars);
  const visiblePart = data.slice(-visibleChars);
  
  return maskedPart + visiblePart;
};