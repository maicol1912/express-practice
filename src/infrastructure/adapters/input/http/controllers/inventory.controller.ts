import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { ApiResponse } from '@application/dto/responses';
import { InventoryUseCase } from '@domain/ports/in/inventory.use-case';

@injectable()
export class InventoryController {
  constructor(
    @inject('InventoryUseCase') private inventoryUseCase: InventoryUseCase
  ) { }

  async getStockAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId, storeId } = req.query;

      if (!productId || !storeId) {
        throw new Error('productId and storeId are required');
      }

      const availability = await this.inventoryUseCase.getStockAvailability(
        productId as string,
        storeId as string
      );

      res.status(200).json(ApiResponse.success(availability));
    } catch (error) {
      next(error);
    }
  }

  async getInventoryByStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { storeId } = req.params;
      const inventory = await this.inventoryUseCase.listInventoryByStore(storeId);
      res.status(200).json(ApiResponse.success(inventory, 'Inventory retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getLowStockItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { storeId } = req.query;
      const threshold = parseInt(req.query.threshold as string) || 10;

      if (!storeId) {
        throw new Error('storeId is required');
      }

      const lowStockItems = await this.inventoryUseCase.listLowStockItems(
        storeId as string,
        threshold
      );

      res.status(200).json(ApiResponse.success(lowStockItems, 'Low stock items retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}