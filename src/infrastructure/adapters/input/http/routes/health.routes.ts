import { Router } from 'express';
import { container } from 'tsyringe';
import { HealthController } from '../controllers/health.controller';

const router: Router = Router();
const healthController = container.resolve(HealthController);

router.get('/', (req, res) => healthController.getHealth(req, res));
router.get('/ready', (req, res) => healthController.getReadiness(req, res));
router.get('/live', (req, res) => healthController.getLiveness(req, res));

export default router;