import request from 'supertest';
import express, { Application } from 'express';
import '@infrastructure/config/container.config';
import routes from '@infrastructure/adapters/input/http/routes';
import { errorHandler } from '@shared/middlewares/error-handler.middleware';
import { DatabaseHelper } from '@tests/integration/helpers/database.helper';
import { JwtService } from '@infrastructure/security/jwt.service';

describe('Authorization - E2E Tests', () => {
    let app: Application;
    let adminToken: string;
    let employeeToken: string;
    let store1Id: string;
    let store2Id: string;

    beforeAll(async () => {

        app = express();
        app.use(express.json());
        app.use('/api/v1', routes);
        app.use(errorHandler);

        const jwtService = new JwtService();

        adminToken = jwtService.generateAccessToken({
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

        // Create stores
        const store1Res = await request(app)
            .post('/api/v1/stores')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ code: 'ST001', name: 'Store 1', address: 'Address 1' });
        store1Id = store1Res.body.data.id;

        const store2Res = await request(app)
            .post('/api/v1/stores')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ code: 'ST002', name: 'Store 2', address: 'Address 2' });
        store2Id = store2Res.body.data.id;

        const jwtService = new JwtService();
        employeeToken = jwtService.generateAccessToken({
            id: 'employee-id',
            username: 'employee',
            email: 'employee@test.com',
            role: 'EMPLOYEE',
            storeId: store1Id
        });
    });

    it('should allow admin to access all resources', async () => {
        await request(app)
            .get('/api/v1/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Test', description: 'Test' })
            .expect(201);
    });

    it('should allow employee to access their store inventory', async () => {
        const response = await request(app)
            .get(`/api/v1/inventory/store/${store1Id}`)
            .set('Authorization', `Bearer ${employeeToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
    });

    it('should deny employee access to other store inventory', async () => {
        await request(app)
            .get(`/api/v1/inventory/store/${store2Id}`)
            .set('Authorization', `Bearer ${employeeToken}`)
            .expect(403);
    });
});