import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { CategoryRequestDTO } from '@application/dto/requests';
import { ApiResponse } from '@application/dto/responses';
import { validateDto } from '@shared/utils/validation.util';
import { CategoryUseCase } from '@domain/ports/in/category.use-case';
import {
  Public,
  RequireAdmin,
  RequireAuth,
  RequireRoles,
  RequireStoreAccess
} from '@shared/decorators/security.decorator';

@injectable()
@Public()
export class CategoryController {
  constructor(
    @inject('CategoryUseCase') private categoryUseCase: CategoryUseCase
  ) { }

  @Public()
  @RequireAuth()// ===== REQUIERE AUTENTICACIÓN (ADMIN O EMPLOYEE) =====
  @RequireAdmin()// ===== SOLO ADMIN =====
  @RequireRoles('ADMIN', 'EMPLOYEE')// ===== ADMIN O EMPLOYEE DE LA TIENDA ESPECÍFICA =====
  @RequireStoreAccess('storeId')// ===== TIENDA ESPECÍFICA =====
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(CategoryRequestDTO, req.body);
      const result = await this.categoryUseCase.create(dto.name, dto.description || null);
      res.status(201).json(ApiResponse.success(result, 'Category created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.categoryUseCase.findById(id);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 0;
      const size = parseInt(req.query.size as string) || 20;
      console.log('PAGE', page);
      console.log('SIZE', size);
      const result = await this.categoryUseCase.findAll(page, size);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = await validateDto(CategoryRequestDTO, req.body);
      const result = await this.categoryUseCase.update(id, dto.name, dto.description || null);
      res.status(200).json(ApiResponse.success(result, 'Category updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.categoryUseCase.delete(id);
      res.status(200).json(ApiResponse.success(null, 'Category deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}