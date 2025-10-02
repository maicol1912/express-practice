import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { CreateUserRequestDTO } from '@application/dto/requests';
import { ApiResponse } from '@application/dto/responses';
import { validateDto } from '@shared/utils/validation.util';
import { UserUseCase } from '@domain/ports/in/user.use-case';

@injectable()
export class UserController {

  constructor(@inject('UserUseCase') private userService: UserUseCase) { }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(CreateUserRequestDTO, req.body);
      // Note: You need to get roleId from roleName
      const result = await this.userService.create(
        dto.username,
        dto.email,
        dto.password,
        dto.roleName, // This should be roleId - needs adjustment
        dto.storeId
      );
      res.status(201).json(ApiResponse.success(result, 'User created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.userService.findById(id);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async listEmployees(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.userService.listEmployees();
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async listAdmins(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.userService.listAdmins();
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.userService.delete(id);
      res.status(200).json(ApiResponse.success(null, 'User deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}
