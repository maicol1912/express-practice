import * as jwt from 'jsonwebtoken';
import { SignOptions } from "jsonwebtoken";
import { TokenExpiredException } from '@domain/exceptions/domain.exception';
import { logger } from '@infrastructure/config/logger.config';

export interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  storeId: string | null;
}

export class JwtService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'default-secret';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
    this.accessTokenExpiration = process.env.JWT_EXPIRATION || '1h';
    this.refreshTokenExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';
  }

  generateAccessToken(payload: JwtPayload): string {

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiration,
    } as SignOptions);
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiration,
    } as SignOptions);
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      logger.error('Error verifying access token:', error);
      throw new TokenExpiredException();
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      logger.error('Error verifying refresh token:', error);
      throw new TokenExpiredException();
    }
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
