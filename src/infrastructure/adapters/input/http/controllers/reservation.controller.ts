import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import {
  ReserveStockRequestDTO,
  ReleaseStockRequestDTO,
  ConfirmSaleRequestDTO
} from '@application/dto/requests';
import { ApiResponse } from '@application/dto/responses';
import { validateDto } from '@shared/utils/validation.util';
import { ReservationUseCase } from '@domain/ports/in/reservation.use-case';

@injectable()
export class ReservationController {
  constructor(
    @inject('ReservationUseCase') private reservationUseCase: ReservationUseCase
  ) { }

  async reserveStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(ReserveStockRequestDTO, req.body);
      const result = await this.reservationUseCase.reserveStock(
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
      const result = await this.reservationUseCase.releaseStock(
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
      const result = await this.reservationUseCase.confirmSale(
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