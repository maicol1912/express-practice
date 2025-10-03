import { Retry } from '@shared/decorators/retry.decorator';

describe('Retry Decorator - Unit Tests', () => {
    class TestService {
        attemptCount = 0;
        failUntilAttempt = 0;

        @Retry({ maxAttempts: 3, delayMs: 100 })
        async unreliableOperation(): Promise<string> {
            this.attemptCount++;

            if (this.attemptCount < this.failUntilAttempt) {
                throw new Error('Temporary failure');
            }

            return 'Success';
        }
    }

    it('should succeed on first attempt', async () => {
        const service = new TestService();
        service.failUntilAttempt = 1;

        const result = await service.unreliableOperation();

        expect(result).toBe('Success');
        expect(service.attemptCount).toBe(1);
    });

    it('should retry and succeed on second attempt', async () => {
        const service = new TestService();
        service.failUntilAttempt = 2;

        const result = await service.unreliableOperation();

        expect(result).toBe('Success');
        expect(service.attemptCount).toBe(2);
    });

    it('should throw after max attempts', async () => {
        const service = new TestService();
        service.failUntilAttempt = 10;

        await expect(service.unreliableOperation()).rejects.toThrow('Temporary failure');
        expect(service.attemptCount).toBe(3);
    });
});