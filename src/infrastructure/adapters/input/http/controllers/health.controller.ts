// src/infrastructure/adapters/input/http/controllers/health.controller.ts
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';

import { logger } from '@shared/utils/logger.util';
import { HealthService } from '@application/services/health.service';

@injectable()
export class HealthController {
    constructor(
        @inject(HealthService)
        private readonly healthService: HealthService
    ) { }

    async getHealth(_req: Request, res: Response): Promise<void> {
        try {
            const health = await this.healthService.getHealthStatus();

            const statusCode = health.status === 'UP' ? 200 : 503;

            res.status(statusCode).json(health);
        } catch (error) {
            logger.error('Error in health check:', error);
            res.status(503).json({
                status: 'DOWN',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    getReadiness(_req: Request, res: Response): void {
        try {
            const isReady = this.healthService.isReady();

            if (isReady) {
                res.status(200).json({
                    status: 'READY',
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(503).json({
                    status: 'NOT_READY',
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            logger.error('Error in readiness check:', error);
            res.status(503).json({
                status: 'NOT_READY',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    getLiveness(_req: Request, res: Response): void {
        const isAlive = this.healthService.isAlive();

        res.status(200).json({
            status: isAlive,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    }
}