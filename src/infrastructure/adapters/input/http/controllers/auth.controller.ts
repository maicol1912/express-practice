import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { LoginRequestDTO } from '@application/dto/requests';
import { ApiResponse } from '@application/dto/responses';
import { validateDto } from '@shared/utils/validation.util';
import { AuthenticationUseCase } from '@domain/ports/in/authentication.use-case';

@injectable()
export class AuthController {
  constructor(
    @inject('AuthenticationUseCase') private authUseCase: AuthenticationUseCase
  ) { }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginDto = await validateDto(LoginRequestDTO, req.body);
      const result = await this.authUseCase.login(loginDto.username, loginDto.password);
      res.status(200).json(ApiResponse.success(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id || '';
      await this.authUseCase.logout(userId);
      res.status(200).json(ApiResponse.success(null, 'Logout successful'));
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await this.authUseCase.refreshToken(refreshToken);
      res.status(200).json(ApiResponse.success(result, 'Token refreshed successfully'));
    } catch (error) {
      next(error);
    }
  }
}