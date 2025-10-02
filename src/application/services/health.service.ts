import { injectable } from 'tsyringe';
import { AppDataSource } from '@infrastructure/config/database.config';
import { redisClient } from '@infrastructure/config/redis.config';
import { logger } from '@shared/utils/logger.util';

export interface ServiceHealth {
    status: 'UP' | 'DOWN';
    message?: string;
    responseTime?: number;
}

export interface HealthResponse {
    status: 'UP' | 'DOWN';
    timestamp: string;
    services: {
        database: ServiceHealth;
        redis: ServiceHealth;
    };
    uptime: number;
    memory: {
        used: number;
        total: number;
        unit: string;
    };
}

@injectable()
export class HealthService {
    async checkDatabaseHealth(): Promise<ServiceHealth> {
        const startTime = Date.now();

        try {
            if (!AppDataSource.isInitialized) {
                return {
                    status: 'DOWN',
                    message: 'Database not initialized',
                    responseTime: Date.now() - startTime
                };
            }

            await AppDataSource.query('SELECT 1');

            return {
                status: 'UP',
                responseTime: Date.now() - startTime
            };
        } catch (error) {
            logger.error('Database health check failed:', error);
            return {
                status: 'DOWN',
                message: error instanceof Error ? error.message : 'Unknown error',
                responseTime: Date.now() - startTime
            };
        }
    }

    async checkRedisHealth(): Promise<ServiceHealth> {
        const startTime = Date.now();

        try {
            if (redisClient.status !== 'ready') {
                return {
                    status: 'DOWN',
                    message: `Redis status: ${redisClient.status}`,
                    responseTime: Date.now() - startTime
                };
            }

            const pingResult = await redisClient.ping();

            if (pingResult === 'PONG') {
                return {
                    status: 'UP',
                    responseTime: Date.now() - startTime
                };
            }

            return {
                status: 'DOWN',
                message: 'Ping failed',
                responseTime: Date.now() - startTime
            };
        } catch (error) {
            logger.error('Redis health check failed:', error);
            return {
                status: 'DOWN',
                message: error instanceof Error ? error.message : 'Unknown error',
                responseTime: Date.now() - startTime
            };
        }
    }

    async getHealthStatus(): Promise<HealthResponse> {
        const [database, redis] = await Promise.all([
            this.checkDatabaseHealth(),
            this.checkRedisHealth(),
        ]);

        const isHealthy = database.status === 'UP' && redis.status === 'UP';

        return {
            status: isHealthy ? 'UP' : 'DOWN',
            timestamp: new Date().toISOString(),
            services: {
                database,
                redis,
            },
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                unit: 'MB',
            },
        };
    }

    isReady(): boolean {
        return (
            AppDataSource.isInitialized &&
            redisClient.status === 'ready'
        );
    }

    isAlive(): boolean {
        return true; // Si el proceso responde, está vivo
    }
}