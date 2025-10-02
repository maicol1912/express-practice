import { Router } from 'express';
import { container } from 'tsyringe';
import { InventoryController } from '../controllers/inventory.controller';

const router: Router = Router();
const inventoryController = container.resolve(InventoryController);

router.get('/availability', (req, res, next) => inventoryController.getStockAvailability(req, res, next));
router.get('/store/:storeId', (req, res, next) => inventoryController.getInventoryByStore(req, res, next));
router.get('/low-stock', (req, res, next) => inventoryController.getLowStockItems(req, res, next));

export default router;