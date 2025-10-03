// src/__tests__/setup.ts
import 'reflect-metadata';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';

initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

// Mock de Redis
jest.mock('@infrastructure/config/redis.config', () => ({
    redisClient: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        setex: jest.fn(),
        expire: jest.fn(),
        ttl: jest.fn(),
        exists: jest.fn(),
        quit: jest.fn().mockResolvedValue('OK'),
        disconnect: jest.fn(),
        on: jest.fn(),
        status: 'ready',
    },
}));

// Configuración global para cerrar conexiones
afterAll(async () => {
    // Forzar cierre de todas las conexiones pendientes
    await new Promise(resolve => setTimeout(resolve, 500));
});