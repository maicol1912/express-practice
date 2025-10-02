// src/shared/middlewares/security.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { JwtService } from '@infrastructure/security/jwt.service';
import { UserPrincipal } from '@infrastructure/security/user-principal';
import { StoreAccessValidator } from '@infrastructure/security/store-access-validator';
import { logger } from '@shared/utils/logger.util';
import {
  PUBLIC_METADATA_KEY,
  ROLES_METADATA_KEY,
  STORE_ACCESS_METADATA_KEY
} from '@shared/decorators/security.decorator';

export interface AuthRequest extends Request {
  user?: UserPrincipal;
}

/**
 * Middleware global de seguridad que se aplica a todas las rutas
 * Verifica decoradores @Public, @RequireRoles, @RequireStoreAccess
 */
export const globalSecurityMiddleware = (
  controllerInstance: any,
  methodName: string
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const controllerPrototype = Object.getPrototypeOf(controllerInstance);

      // Verificar si la clase tiene @Public
      const isClassPublic = Reflect.getMetadata(
        PUBLIC_METADATA_KEY,
        controllerInstance.constructor
      );

      // Verificar si el método tiene @Public
      const isMethodPublic = Reflect.getMetadata(
        PUBLIC_METADATA_KEY,
        controllerPrototype,
        methodName
      );

      // Si es público, permitir acceso sin autenticación
      if (isClassPublic || isMethodPublic) {
        logger.debug(`Public access to ${controllerInstance.constructor.name}.${methodName}`);
        return next();
      }

      // ===== AUTENTICACIÓN OBLIGATORIA =====
      const jwtService = container.resolve(JwtService);
      const token = jwtService.extractTokenFromHeader(req.headers.authorization);

      if (!token) {
        res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: 'Authentication required - No token provided',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const payload = await jwtService.verifyAccessToken(token);
      req.user = new UserPrincipal(
        payload.id,
        payload.username,
        payload.email,
        payload.role,
        payload.storeId
      );

      // ===== VALIDACIÓN DE ROLES =====
      const requiredRoles = Reflect.getMetadata(
        ROLES_METADATA_KEY,
        controllerPrototype,
        methodName
      ) as string[] | undefined;

      if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.includes(req.user.role);

        if (!hasRequiredRole) {
          logger.warn(
            `Access denied for user ${req.user.username} with role ${req.user.role}. Required: ${requiredRoles.join(', ')}`
          );
          res.status(403).json({
            status: 'error',
            statusCode: 403,
            message: `Access denied. Required roles: ${requiredRoles.join(', ')}`,
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      // ===== VALIDACIÓN DE ACCESO A STORE =====
      const storeAccessParam = Reflect.getMetadata(
        STORE_ACCESS_METADATA_KEY,
        controllerPrototype,
        methodName
      ) as string | undefined;

      if (storeAccessParam) {
        const storeId = req.params[storeAccessParam] || req.body.storeId || req.query.storeId;

        if (!storeId) {
          res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'Store ID is required',
            timestamp: new Date().toISOString()
          });
          return;
        }

        try {
          StoreAccessValidator.validateAccess(req.user, storeId as string);
        } catch (error) {
          logger.warn(
            `Store access denied for user ${req.user.username} to store ${storeId}`
          );
          res.status(403).json({
            status: 'error',
            statusCode: 403,
            message: error instanceof Error ? error.message : 'Store access denied',
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      // Usuario autenticado y autorizado
      logger.debug(
        `Authorized access: ${req.user.username} (${req.user.role}) -> ${controllerInstance.constructor.name}.${methodName}`
      );
      next();
    } catch (error) {
      logger.error('Security middleware error:', error);
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: error instanceof Error ? error.message : 'Unauthorized',
        timestamp: new Date().toISOString()
      });
    }
  };
};