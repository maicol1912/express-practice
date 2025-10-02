import { Router } from 'express';
import authRoutes from './auth.routes';
import inventoryRoutes from './inventory.routes';
import reservationRoutes from './reservation.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import storeRoutes from './store.routes';
import transferRoutes from './transfer.routes';
import userRoutes from './user.routes';
import healthRoutes from './health.routes'
const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/reservations', reservationRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/stores', storeRoutes);
router.use('/transfers', transferRoutes);
router.use('/users', userRoutes);
router.use('/health', healthRoutes);
export default router;
