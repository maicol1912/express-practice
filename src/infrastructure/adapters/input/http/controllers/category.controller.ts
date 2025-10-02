import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { CategoryService } from '@application/services/category.service';
import { CategoryRequestDTO } from '@application/dto/requests';
import { ApiResponse } from '@application/dto/responses';
import { validateDto } from '@shared/utils/validation.util';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = container.resolve(CategoryService);
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(CategoryRequestDTO, req.body);
      const result = await this.categoryService.create(dto.name, dto.description || null);
      res.status(201).json(ApiResponse.success(result, 'Category created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.categoryService.findById(id);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 0;
      const size = parseInt(req.query.size as string) || 20;
      console.log('PAGE', page)
      console.log('SIZE', size)
      const result = await this.categoryService.findAll(page, size);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = await validateDto(CategoryRequestDTO, req.body);
      const result = await this.categoryService.update(id, dto.name, dto.description || null);
      res.status(200).json(ApiResponse.success(result, 'Category updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.categoryService.delete(id);
      res.status(200).json(ApiResponse.success(null, 'Category deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}
