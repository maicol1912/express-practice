import "reflect-metadata"
import request from 'supertest';
import express, { Application } from 'express';
import '@infrastructure/config/container.config';
import routes from '@infrastructure/adapters/input/http/routes';
import { errorHandler } from '@shared/middlewares/error-handler.middleware';
import { DatabaseHelper } from '../integration/helpers/database.helper';
import { JwtService } from '@infrastructure/security/jwt.service';

describe('Inventory Flow - E2E Tests', () => {
    let app: Application;
    let adminToken: string;
    let storeId: string;
    let categoryId: string;
    let productId: string;

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
    });

    it('should complete full inventory workflow', async () => {
        // 1. Create Store
        const storeResponse = await request(app)
            .post('/api/v1/stores')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                code: 'STORE01',
                name: 'Main Store',
                address: '123 Main St'
            })
            .expect(201);

        storeId = storeResponse.body.data.id;

        // 2. Create Category
        const categoryResponse = await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Electronics',
                description: 'Electronic products'
            })
            .expect(201);

        categoryId = categoryResponse.body.data.id;

        // 3. Create Product
        const productResponse = await request(app)
            .post('/api/v1/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                sku: 'PROD001',
                name: 'Laptop',
                description: 'Gaming Laptop',
                categoryId: categoryId,
                price: 999.99
            })
            .expect(201);

        productId = productResponse.body.data.id;

        // 4. Check Initial Stock Availability
        await request(app)
            .get(`/api/v1/inventory/availability?productId=${productId}&storeId=${storeId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(404); // No inventory yet

        // 5. Reserve Stock (should fail - no stock)
        await request(app)
            .post('/api/v1/reservations/reserve-stock')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                storeId: storeId,
                productId: productId,
                quantity: 1,
                orderRef: 'ORD-001'
            })
            .expect(404);

        // 6. Confirm Sale (workflow complete)
        const saleResponse = await request(app)
            .post('/api/v1/reservations/confirm-stock')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                storeId: storeId,
                productId: productId,
                quantity: 1,
                orderRef: 'ORD-001'
            })
            .expect(200);

        expect(saleResponse.body.success).toBe(true);
    });
});