import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router: Router = Router();
const userController = new UserController();

router.post('/', (req, res, next) => userController.create(req, res, next));
router.get('/employees', (req, res, next) => userController.listEmployees(req, res, next));
router.get('/admins', (req, res, next) => userController.listAdmins(req, res, next));
router.get('/:id', (req, res, next) => userController.findById(req, res, next));
router.delete('/:id', (req, res, next) => userController.delete(req, res, next));

export default router;
