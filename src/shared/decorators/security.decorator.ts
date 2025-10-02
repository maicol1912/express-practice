// src/shared/decorators/security.decorators.ts
import 'reflect-metadata';

// Metadata keys
export const PUBLIC_METADATA_KEY = Symbol('isPublic');
export const ROLES_METADATA_KEY = Symbol('requiredRoles');
export const STORE_ACCESS_METADATA_KEY = Symbol('requiresStoreAccess');

/**
 * Marca un método o clase como público (sin autenticación)
 */
export function Public(): MethodDecorator & ClassDecorator {
    return (target: any, propertyKey?: string | symbol) => {
        if (propertyKey) {
            // Aplicado a un método
            Reflect.defineMetadata(PUBLIC_METADATA_KEY, true, target, propertyKey);
        } else {
            // Aplicado a una clase
            Reflect.defineMetadata(PUBLIC_METADATA_KEY, true, target);
        }
    };
}

/**
 * Requiere roles específicos para acceder
 * @param roles - Array de roles permitidos
 */
export function RequireRoles(...roles: string[]): MethodDecorator {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.defineMetadata(ROLES_METADATA_KEY, roles, target, propertyKey);
    };
}

/**
 * Requiere acceso a un store específico
 * @param storeIdParam - Nombre del parámetro que contiene el storeId
 */
export function RequireStoreAccess(storeIdParam: string = 'storeId'): MethodDecorator {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.defineMetadata(STORE_ACCESS_METADATA_KEY, storeIdParam, target, propertyKey);
    };
}

/**
 * Alias para RequireRoles con solo ADMIN
 */
export function RequireAdmin(): MethodDecorator {
    return RequireRoles('ADMIN');
}

/**
 * Alias para RequireRoles con ADMIN y EMPLOYEE
 */
export function RequireAuth(): MethodDecorator {
    return RequireRoles('ADMIN', 'EMPLOYEE');
}