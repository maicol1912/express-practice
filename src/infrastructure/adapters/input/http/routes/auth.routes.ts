import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { container } from 'tsyringe';

const router: Router = Router();
const authController = container.resolve(AuthController);

router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/refresh', (req, res, next) => authController.refreshToken(req, res, next));

export default router;
