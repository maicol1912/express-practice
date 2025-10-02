import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { InventoryService } from '@application/services/inventory.service';
import { ApiResponse } from '@application/dto/responses';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = container.resolve(InventoryService);
  }

  async getStockAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId, storeId } = req.query;

      if (!productId || !storeId) {
        throw new Error('productId and storeId are required');
      }

      const availability = await this.inventoryService.getStockAvailability(
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
      const inventory = await this.inventoryService.listInventoryByStore(storeId);
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

      const lowStockItems = await this.inventoryService.listLowStockItems(
        storeId as string,
        threshold
      );

      res.status(200).json(ApiResponse.success(lowStockItems, 'Low stock items retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}
