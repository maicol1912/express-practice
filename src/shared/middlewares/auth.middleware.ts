import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@infrastructure/security/jwt.service';
import { TokenExpiredException, AccessDeniedException } from '@domain/exceptions/domain.exception';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    storeId: string | null;
  };
}

export async function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AccessDeniedException('No token provided');
    }

    const token = authHeader.substring(7);
    const jwtService = new JwtService();

    const decoded = await jwtService.verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof TokenExpiredException || error instanceof AccessDeniedException) {
      next(error);
    } else {
      next(new TokenExpiredException());
    }
  }
}
