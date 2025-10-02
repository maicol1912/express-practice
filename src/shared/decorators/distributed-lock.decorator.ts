import { LockAcquisitionException } from '@domain/exceptions/domain.exception';
import { DistributedLockManager } from '@infrastructure/adapters/output/lock/distributed-lock.manager';
import { v4 as uuidv4 } from 'uuid';

export interface DistributedLockOptions {
  key: string;
  waitTimeoutSeconds?: number;
  leaseTimeSeconds?: number;
}

export function DistributedLock(options: DistributedLockOptions) {
  return function (
    _target: any,
    _propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const lockManager = new DistributedLockManager();

      // Evaluar la key con los argumentos del método
      const lockKey = evaluateLockKey(options.key, args);
      const lockValue = uuidv4();

      const acquired = await lockManager.acquireLock(
        lockKey,
        lockValue,
        options.waitTimeoutSeconds || 30,
        options.leaseTimeSeconds || 60
      );

      if (!acquired) {
        throw new LockAcquisitionException(lockKey);
      }

      try {
        return await originalMethod.apply(this, args);
      } finally {
        await lockManager.releaseLock(lockKey, lockValue);
      }
    };

    return descriptor;
  };
}

function evaluateLockKey(keyExpression: string, args: any[]): string {
  // Simple template evaluation: "inventory:${0}:${1}" -> "inventory:storeId:productId"
  return keyExpression.replace(/\$\{(\d+)\}/g, (match, index) => {
    return args[parseInt(index)] || match;
  });
}
