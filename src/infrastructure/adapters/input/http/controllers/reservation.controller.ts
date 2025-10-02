import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ReservationService } from '@application/services/reservation.service';
import {
  ReserveStockRequestDTO,
  ReleaseStockRequestDTO,
  ConfirmSaleRequestDTO
} from '@application/dto/requests';
import { ApiResponse } from '@application/dto/responses';
import { validateDto } from '../../../../../shared/utils/validation.util';

export class ReservationController {
  private reservationService: ReservationService;

  constructor() {
    this.reservationService = container.resolve(ReservationService);
  }

  async reserveStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(ReserveStockRequestDTO, req.body);

      const result = await this.reservationService.reserveStock(
        dto.storeId,
        dto.productId,
        dto.quantity,
        dto.orderRef
      );

      res.status(201).json(ApiResponse.success(result, 'Stock reserved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async releaseStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(ReleaseStockRequestDTO, req.body);

      const result = await this.reservationService.releaseStock(
        dto.storeId,
        dto.productId,
        dto.quantity,
        dto.orderRef
      );

      res.status(200).json(ApiResponse.success(result, 'Stock released successfully'));
    } catch (error) {
      next(error);
    }
  }

  async confirmSale(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(ConfirmSaleRequestDTO, req.body);

      const result = await this.reservationService.confirmSale(
        dto.storeId,
        dto.productId,
        dto.quantity,
        dto.orderRef
      );

      res.status(200).json(ApiResponse.success(result, 'Sale confirmed successfully'));
    } catch (error) {
      next(error);
    }
  }
}
