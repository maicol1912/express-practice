import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';

const router: Router = Router();
const categoryController = new CategoryController();

router.post('/', (req, res, next) => categoryController.create(req, res, next));
router.get('/', (req, res, next) => categoryController.findAll(req, res, next));
router.get('/:id', (req, res, next) => categoryController.findById(req, res, next));
router.put('/:id', (req, res, next) => categoryController.update(req, res, next));
router.delete('/:id', (req, res, next) => categoryController.delete(req, res, next));

export default router;
