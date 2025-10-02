// src/shared/utils/route.util.ts
import { Router, Response, NextFunction, Request } from 'express';
import { globalSecurityMiddleware } from '@shared/middlewares/auth.middleware';
import { UserPrincipal } from '@infrastructure/security/user-principal';

// Extend Express Request type to include UserPrincipal
declare global {
    namespace Express {
        interface Request {
            user?: UserPrincipal;
        }
    }
}

// Create a type alias for the extended Request
export type AuthRequest = Request & {
    user?: UserPrincipal;
};

/**
 * Helper para crear rutas con seguridad automática basada en decoradores
 */
export class SecureRoute {
    static register(
        router: Router,
        method: 'get' | 'post' | 'put' | 'delete' | 'patch',
        path: string,
        controller: any,
        methodName: string
    ): void {
        const securityMiddleware = globalSecurityMiddleware(controller, methodName);

        router[method](
            path,
            securityMiddleware,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    await controller[methodName](req, res, next);
                } catch (error) {
                    next(error);
                }
            }
        );
    }

    static get(router: Router, path: string, controller: any, methodName: string): void {
        this.register(router, 'get', path, controller, methodName);
    }

    static post(router: Router, path: string, controller: any, methodName: string): void {
        this.register(router, 'post', path, controller, methodName);
    }

    static put(router: Router, path: string, controller: any, methodName: string): void {
        this.register(router, 'put', path, controller, methodName);
    }

    static delete(router: Router, path: string, controller: any, methodName: string): void {
        this.register(router, 'delete', path, controller, methodName);
    }

    static patch(router: Router, path: string, controller: any, methodName: string): void {
        this.register(router, 'patch', path, controller, methodName);
    }
}

export { };