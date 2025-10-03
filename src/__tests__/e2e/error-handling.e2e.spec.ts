import "reflect-metadata"
import request from 'supertest';
import express, { Application } from 'express';
import '@infrastructure/config/container.config';
import routes from '@infrastructure/adapters/input/http/routes';
import { errorHandler } from '@shared/middlewares/error-handler.middleware';
import { DatabaseHelper } from '../integration/helpers/database.helper';
import { JwtService } from '@infrastructure/security/jwt.service';

describe('Error Handling - E2E Tests', () => {
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

    it('should return 404 for non-existent route', async () => {
        const response = await request(app)
            .get('/api/v1/non-existent')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body).toHaveProperty('statusCode', 404);
    });

    it('should return 401 for missing token', async () => {
        await request(app)
            .get('/api/v1/categories')
            .expect(401);
    });

    it('should return 401 for invalid token', async () => {
        await request(app)
            .get('/api/v1/categories')
            .set('Authorization', 'Bearer invalid-token')
            .expect(401);
    });

    it('should return 400 for validation errors', async () => {
        const response = await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: '', // Invalid: empty name
                description: 'Test'
            })
            .expect(400);

        expect(response.body.error).toContain('Validation');
    });

    it('should return 404 for non-existent resource', async () => {
        const response = await request(app)
            .get('/api/v1/categories/non-existent-id')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.errorCode).toBe('RESOURCE_NOT_FOUND');
    });

    it('should return 409 for duplicate resource', async () => {
        await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Electronics', description: 'Test' });

        const response = await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Electronics', description: 'Test' })
            .expect(409);

        expect(response.body.errorCode).toBe('ALREADY_EXISTS');
    });
});