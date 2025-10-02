import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { CreateTransferRequestDTO } from '@application/dto/requests';
import { ApiResponse } from '@application/dto/responses';
import { validateDto } from '@shared/utils/validation.util';
import { TransferUseCase } from '@domain/ports/in/transfer.use-case';

@injectable()
export class TransferController {
  constructor(
    @inject('TransferUseCase') private transferUseCase: TransferUseCase
  ) { }

  async createTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(CreateTransferRequestDTO, req.body);
      const actor = (req as any).user?.id || 'system';
      const result = await this.transferUseCase.createTransfer(
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
      const result = await this.transferUseCase.getTransferById(id);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async listTransfers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeId = req.query.storeId as string | undefined;
      const productId = req.query.productId as string | undefined;
      const status = req.query.status as any; // Consider typing status if possible
      const result = await this.transferUseCase.listTransfers(storeId, productId, status);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async startTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const actor = (req as any).user?.id || 'system';
      const result = await this.transferUseCase.startTransfer(id, actor);
      res.status(200).json(ApiResponse.success(result, 'Transfer started successfully'));
    } catch (error) {
      next(error);
    }
  }

  async completeTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const actor = (req as any).user?.id || 'system';
      const result = await this.transferUseCase.completeTransfer(id, actor);
      res.status(200).json(ApiResponse.success(result, 'Transfer completed successfully'));
    } catch (error) {
      next(error);
    }
  }

  async failTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const actor = (req as any).user?.id || 'system';
      const result = await this.transferUseCase.failTransfer(id, actor);
      res.status(200).json(ApiResponse.success(result, 'Transfer failed successfully'));
    } catch (error) {
      next(error);
    }
  }
}