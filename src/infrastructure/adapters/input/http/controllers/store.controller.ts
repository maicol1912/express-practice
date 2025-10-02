import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { StoreRequestDTO } from '@application/dto/requests';
import { ApiResponse } from '@application/dto/responses';
import { validateDto } from '@shared/utils/validation.util';
import { StoreUseCase } from '@domain/ports/in/store.use-case';

@injectable()
export class StoreController {
  constructor(
    @inject('StoreUseCase') private storeUseCase: StoreUseCase
  ) { }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(StoreRequestDTO, req.body);
      const result = await this.storeUseCase.create(dto.code, dto.name, dto.address);
      res.status(201).json(ApiResponse.success(result, 'Store created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.storeUseCase.findById(id);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 0;
      const size = parseInt(req.query.size as string) || 20;
      const result = await this.storeUseCase.findAll(page, size);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = await validateDto(StoreRequestDTO, req.body);
      const result = await this.storeUseCase.update(id, dto.code, dto.name, dto.address);
      res.status(200).json(ApiResponse.success(result, 'Store updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.storeUseCase.delete(id);
      res.status(200).json(ApiResponse.success(null, 'Store deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}