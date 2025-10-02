import { RedisCacheService } from '@infrastructure/adapters/output/cache/redis-cache.service';

export interface CacheableOptions {
  key: string;
  ttl?: number;
}

export function Cacheable(options: CacheableOptions) {
  return function (
    _target: any,
    _propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = new RedisCacheService();
      const cacheKey = evaluateCacheKey(options.key, args);

      // Try to get from cache
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Execute method
      const result = await originalMethod.apply(this, args);

      // Save to cache
      await cacheService.set(cacheKey, result, options.ttl);

      return result;
    };

    return descriptor;
  };
}

function evaluateCacheKey(keyExpression: string, args: any[]): string {
  return keyExpression.replace(/\$\{(\d+)\}/g, (match, index) => {
    return args[parseInt(index)] || match;
  });
}
