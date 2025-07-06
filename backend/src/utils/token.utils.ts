import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface TokenPayload {
  userId: string;
  [key: string]: any;
}

// Generate JWT token for authentication
export const generateToken = (payload: TokenPayload, expiresIn = '7d'): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, secret, { expiresIn });
};

// Verify JWT token
export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.verify(token, secret) as TokenPayload;
};

// Generate a random token for email verification or password reset
export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash a token for secure storage in the database
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Generate a verification token with expiry
export const generateVerificationToken = (): { token: string; hashedToken: string; expires: Date } => {
  const token = generateRandomToken();
  const hashedToken = hashToken(token);
  
  // Token expires in 24 hours
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  return { token, hashedToken, expires };
};

// Generate a password reset token with expiry
export const generatePasswordResetToken = (): { token: string; hashedToken: string; expires: Date } => {
  const token = generateRandomToken();
  const hashedToken = hashToken(token);
  
  // Token expires in 1 hour
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  
  return { token, hashedToken, expires };
};