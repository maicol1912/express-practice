import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { StoreService } from '@application/services/store.service';
import { StoreRequestDTO } from '@application/dto/requests';
import { ApiResponse } from '@application/dto/responses';
import { validateDto } from '@shared/utils/validation.util';

export class StoreController {
  private storeService: StoreService;

  constructor() {
    this.storeService = container.resolve(StoreService);
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(StoreRequestDTO, req.body);
      const result = await this.storeService.create(dto.code, dto.name, dto.address);
      res.status(201).json(ApiResponse.success(result, 'Store created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.storeService.findById(id);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 0;
      const size = parseInt(req.query.size as string) || 20;
      const result = await this.storeService.findAll(page, size);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = await validateDto(StoreRequestDTO, req.body);
      const result = await this.storeService.update(id, dto.code, dto.name, dto.address);
      res.status(200).json(ApiResponse.success(result, 'Store updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.storeService.delete(id);
      res.status(200).json(ApiResponse.success(null, 'Store deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}
