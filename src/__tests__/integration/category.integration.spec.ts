import "reflect-metadata"
import request from 'supertest';
import express, { Application } from 'express';
import '@infrastructure/config/container.config';
import routes from '@infrastructure/adapters/input/http/routes';
import { errorHandler } from '@shared/middlewares/error-handler.middleware';
import { DatabaseHelper } from './helpers/database.helper';
import { JwtService } from '@infrastructure/security/jwt.service';

describe('Category API - Integration Tests', () => {
    let app: Application;
    let authToken: string;

    beforeAll(async () => {

        app = express();
        app.use(express.json());
        app.use('/api/v1', routes);
        app.use(errorHandler);

        const jwtService = new JwtService();
        authToken = jwtService.generateAccessToken({
            id: 'admin-id',
            username: 'admin',
            email: 'admin@test.com',
            role: 'ADMIN',
            storeId: null
        });
    });

    afterAll(async () => {
        await DatabaseHelper.cleanup();
    });

    beforeEach(async () => {
        await DatabaseHelper.clearDatabase();
    });

    describe('POST /api/v1/categories', () => {
        it('should create a new category', async () => {
            const categoryData = {
                name: 'Electronics',
                description: 'Electronic products'
            };

            const response = await request(app)
                .post('/api/v1/categories')
                .set('Authorization', `Bearer ${authToken}`)
                .send(categoryData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                name: categoryData.name,
                description: categoryData.description
            });
        });

        it('should return 401 without authentication', async () => {
            await request(app)
                .post('/api/v1/categories')
                .send({ name: 'Test', description: 'Test' })
                .expect(401);
        });

        it('should return 409 for duplicate category', async () => {
            const categoryData = { name: 'Electronics', description: 'Test' };

            await request(app)
                .post('/api/v1/categories')
                .set('Authorization', `Bearer ${authToken}`)
                .send(categoryData)
                .expect(201);

            await request(app)
                .post('/api/v1/categories')
                .set('Authorization', `Bearer ${authToken}`)
                .send(categoryData)
                .expect(409);
        });
    });

    describe('GET /api/v1/categories', () => {
        it('should return paginated categories', async () => {
            await request(app)
                .post('/api/v1/categories')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Category 1', description: 'Desc 1' });

            await request(app)
                .post('/api/v1/categories')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Category 2', description: 'Desc 2' });

            const response = await request(app)
                .get('/api/v1/categories?page=1&size=10')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.data.data).toHaveLength(2);
            expect(response.body.data.total).toBe(2);
        });
    });
});