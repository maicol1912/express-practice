import { Router } from 'express';
import { container } from 'tsyringe';
import { StoreController } from '../controllers/store.controller';

const router: Router = Router();
const storeController = container.resolve(StoreController);

router.post('/', (req, res, next) => storeController.create(req, res, next));
router.get('/', (req, res, next) => storeController.findAll(req, res, next));
router.get('/:id', (req, res, next) => storeController.findById(req, res, next));
router.put('/:id', (req, res, next) => storeController.update(req, res, next));
router.delete('/:id', (req, res, next) => storeController.delete(req, res, next));

export default router;