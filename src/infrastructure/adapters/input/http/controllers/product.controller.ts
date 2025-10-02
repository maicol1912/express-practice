import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ProductService } from '@application/services/product.service';
import { ProductRequestDTO } from '@application/dto/requests';
import { ApiResponse } from '@application/dto/responses';
import { validateDto } from '../../../../../shared/utils/validation.util';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = container.resolve(ProductService);
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(ProductRequestDTO, req.body);
      const result = await this.productService.create(
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
      const result = await this.productService.findById(id);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 0;
      const size = parseInt(req.query.size as string) || 20;
      const result = await this.productService.findAll(page, size);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = await validateDto(ProductRequestDTO, req.body);
      const result = await this.productService.update(
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
      await this.productService.delete(id);
      res.status(200).json(ApiResponse.success(null, 'Product deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}
