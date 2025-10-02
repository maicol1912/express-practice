import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router: Router = Router();
const productController = new ProductController();

router.post('/', (req, res, next) => productController.create(req, res, next));
router.get('/', (req, res, next) => productController.findAll(req, res, next));
router.get('/:id', (req, res, next) => productController.findById(req, res, next));
router.put('/:id', (req, res, next) => productController.update(req, res, next));
router.delete('/:id', (req, res, next) => productController.delete(req, res, next));

export default router;
