import { Router } from 'express';
import { TransferController } from '../controllers/transfer.controller';

const router: Router = Router();
const transferController = new TransferController();

router.post('/', (req, res, next) => transferController.createTransfer(req, res, next));
router.get('/', (req, res, next) => transferController.listTransfers(req, res, next));
router.get('/:id', (req, res, next) => transferController.getTransferById(req, res, next));
router.post('/:id/start', (req, res, next) => transferController.startTransfer(req, res, next));
router.post('/:id/complete', (req, res, next) => transferController.completeTransfer(req, res, next));
router.post('/:id/fail', (req, res, next) => transferController.failTransfer(req, res, next));

export default router;
