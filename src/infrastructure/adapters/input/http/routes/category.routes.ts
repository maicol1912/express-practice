import { Router } from 'express';
import { container } from 'tsyringe';
import { CategoryController } from '../controllers/category.controller';
import { SecureRoute } from '@shared/utils/route.util';

const router: Router = Router();
const categoryController = container.resolve(CategoryController);

SecureRoute.post(router, '/', categoryController, 'create');
SecureRoute.get(router, '/', categoryController, 'findAll');
SecureRoute.get(router, '/:id', categoryController, 'findById');
SecureRoute.put(router, '/:id', categoryController, 'update');
SecureRoute.delete(router, '/:id', categoryController, 'delete');

export default router;