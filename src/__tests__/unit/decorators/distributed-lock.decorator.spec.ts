import { DistributedLock } from '@shared/decorators/distributed-lock.decorator';

describe('DistributedLock Decorator - Unit Tests', () => {
    class TestService {
        callCount = 0;

        @DistributedLock({ key: 'test:${0}', waitTimeoutSeconds: 5, leaseTimeSeconds: 10 })
        async processWithLock(id: string): Promise<string> {
            this.callCount++;
            return `Processed: ${id}`;
        }
    }

    it('should execute method when lock is acquired', async () => {
        const service = new TestService();
        const result = await service.processWithLock('item-1');

        expect(result).toBe('Processed: item-1');
        expect(service.callCount).toBe(1);
    });
});
