import 'reflect-metadata';
import 'source-map-support/register';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { configureDependencyInjection } from './infrastructure/config/container.config';
import { errorHandler } from './shared/middlewares/error-handler.middleware';
import { logger } from './shared/utils/logger.util';
import { AppDataSource } from '@infrastructure/config/database.config';

// Load environment variables
dotenv.config();

// Configure dependency injection BEFORE importing routes


class Server {
  private app: Application;
  private port: number;

  constructor() {
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
    // Health check
    this.app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'UP', timestamp: new Date() });
    });

    // API routes - import after DI is configured
    const routes = require('./infrastructure/adapters/input/http/routes').default;
    this.app.use('/api/v1', routes);

    // 404 handler
    this.app.use((_req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await AppDataSource.initialize();
      logger.info('✅ Database connected successfully');
      logger.info(`📊 Database: ${process.env.DB_NAME || 'distributed_inventory'}`);
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
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
