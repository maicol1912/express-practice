import { injectable } from 'tsyringe';
import { CachePort } from '@domain/ports/out/cache.port';
import { redisClient } from '@infrastructure/config/redis.config';
import { logger } from '@infrastructure/config/logger.config';

@injectable()
export class RedisCacheService implements CachePort {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Error getting from cache:', { key, error });
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    try {
      await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
      logger.debug('Cache set:', { key, ttl: ttlSeconds });
    } catch (error) {
      logger.error('Error setting cache:', { key, error });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
      logger.debug('Cache deleted:', { key });
    } catch (error) {
      logger.error('Error deleting from cache:', { key, error });
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
        logger.debug('Cache pattern deleted:', { pattern, count: keys.length });
      }
    } catch (error) {
      logger.error('Error deleting cache pattern:', { pattern, error });
    }
  }
}
