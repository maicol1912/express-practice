import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { ProductRequestDTO } from '@application/dto/requests';
import { ApiResponse } from '@application/dto/responses';
import { validateDto } from '@shared/utils/validation.util';
import { ProductUseCase } from '@domain/ports/in/product.use-case';

@injectable()
export class ProductController {
  constructor(
    @inject('ProductUseCase') private productUseCase: ProductUseCase
  ) { }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(ProductRequestDTO, req.body);
      const result = await this.productUseCase.create(
        dto.sku,
        dto.name,
        dto.description || null,
        dto.categoryId,
        dto.price
      );
      res.status(201).json(ApiResponse.success(result, 'Product created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.productUseCase.findById(id);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 0;
      const size = parseInt(req.query.size as string) || 20;
      const result = await this.productUseCase.findAll(page, size);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = await validateDto(ProductRequestDTO, req.body);
      const result = await this.productUseCase.update(
        id,
        dto.sku,
        dto.name,
        dto.description || null,
        dto.categoryId,
        dto.price
      );
      res.status(200).json(ApiResponse.success(result, 'Product updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.productUseCase.delete(id);
      res.status(200).json(ApiResponse.success(null, 'Product deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}