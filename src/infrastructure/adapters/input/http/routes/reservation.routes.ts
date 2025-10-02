import { Router } from 'express';
import { container } from 'tsyringe';
import { ReservationController } from '../controllers/reservation.controller';

const router: Router = Router();
const reservationController = container.resolve(ReservationController);

router.post('/reserve-stock', (req, res, next) => reservationController.reserveStock(req, res, next));
router.post('/release-stock', (req, res, next) => reservationController.releaseStock(req, res, next));
router.post('/confirm-stock', (req, res, next) => reservationController.confirmSale(req, res, next));

export default router;