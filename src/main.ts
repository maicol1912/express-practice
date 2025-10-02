import 'reflect-metadata';
import 'source-map-support/register';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { addTransactionalDataSource, initializeTransactionalContext } from 'typeorm-transactional';
import { configureDependencyInjection } from './infrastructure/config/container.config';
import { errorHandler } from './shared/middlewares/error-handler.middleware';
import { logger } from './shared/utils/logger.util';
import { AppDataSource } from '@infrastructure/config/database.config';

// Load environment variables
dotenv.config();

// ⭐ CRÍTICO: Inicializar el contexto transaccional ANTES de TODO
initializeTransactionalContext();

class Server {
  private app: Application;
  private port: number;

  constructor() {
    // Ya NO va aquí initializeTransactionalContext()
    configureDependencyInjection();
    this.app = express();
    this.port = parseInt(process.env.PORT || '8080', 10);
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security
    this.app.use(helmet());
    this.app.use(cors());

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, _res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    const routes = require('./infrastructure/adapters/input/http/routes').default;
    this.app.use('/api/v1', routes);

    this.app.use((req, res) => {
      res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        suggestion: 'Please check the API documentation for available endpoints'
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await AppDataSource.initialize();

      // ⭐ Registrar el DataSource después de inicializarlo
      addTransactionalDataSource(AppDataSource);

      logger.info('✅ Database connected successfully');
      logger.info(`📊 Database: ${process.env.DB_NAME || 'distributed_inventory'}`);
      logger.info('🔄 Transactional DataSource registered');
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      await this.initializeDatabase();
      this.app.listen(this.port, () => {
        logger.info(`🚀 Server running on port ${this.port}`);
        logger.info(`📡 Health check: http://localhost:${this.port}/health`);
        logger.info(`🔗 API Base URL: http://localhost:${this.port}/api/v1`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new Server();
server.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    logger.info('Database connection closed');
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    logger.info('Database connection closed');
  }
  process.exit(0);
});