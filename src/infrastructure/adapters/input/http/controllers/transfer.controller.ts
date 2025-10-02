import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { TransferService } from '@application/services/transfer.service';
import { CreateTransferRequestDTO } from '@application/dto/requests';
import { ApiResponse } from '@application/dto/responses';
import { validateDto } from '../../../../../shared/utils/validation.util';

export class TransferController {
  private transferService: TransferService;

  constructor() {
    this.transferService = container.resolve(TransferService);
  }

  async createTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(CreateTransferRequestDTO, req.body);
      const actor = (req as any).user?.id || 'system';

      const result = await this.transferService.createTransfer(
        dto.originStoreId,
        dto.destinationStoreId,
        dto.productId,
        dto.quantity,
        actor
      );

      res.status(201).json(ApiResponse.success(result, 'Transfer created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getTransferById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.transferService.getTransferById(id);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async listTransfers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeId = req.query.storeId as string | undefined;
      const productId = req.query.productId as string | undefined;
      const status = req.query.status as any;

      const result = await this.transferService.listTransfers(storeId, productId, status);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async startTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const actor = (req as any).user?.id || 'system';
      const result = await this.transferService.startTransfer(id, actor);
      res.status(200).json(ApiResponse.success(result, 'Transfer started successfully'));
    } catch (error) {
      next(error);
    }
  }

  async completeTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const actor = (req as any).user?.id || 'system';
      const result = await this.transferService.completeTransfer(id, actor);
      res.status(200).json(ApiResponse.success(result, 'Transfer completed successfully'));
    } catch (error) {
      next(error);
    }
  }

  async failTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const actor = (req as any).user?.id || 'system';
      const result = await this.transferService.failTransfer(id, actor);
      res.status(200).json(ApiResponse.success(result, 'Transfer failed successfully'));
    } catch (error) {
      next(error);
    }
  }
}
