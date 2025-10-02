import { redisClient } from '@infrastructure/config/redis.config';
import { logger } from '@infrastructure/config/logger.config';

export class DistributedLockManager {
  async acquireLock(
    key: string,
    value: string,
    waitTimeoutSeconds: number,
    leaseTimeSeconds: number
  ): Promise<boolean> {
    const startTime = Date.now();
    const timeout = waitTimeoutSeconds * 1000;

    while (Date.now() - startTime < timeout) {
      try {
        const result = await redisClient.set(
          key,
          value,
          'EX',
          leaseTimeSeconds,
          'NX'
        );

        if (result === 'OK') {
          logger.debug('Lock acquired:', { key, value });
          return true;
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        logger.error('Error acquiring lock:', { key, error });
        return false;
      }
    }

    logger.warn('Lock acquisition timeout:', { key, waitTimeoutSeconds });
    return false;
  }

  async releaseLock(key: string, value: string): Promise<void> {
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    try {
      await redisClient.eval(luaScript, 1, key, value);
      logger.debug('Lock released:', { key, value });
    } catch (error) {
      logger.error('Error releasing lock:', { key, error });
    }
  }
}
