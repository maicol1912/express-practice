import { StoreAccessValidator } from '@infrastructure/security/store-access-validator';
import { AccessDeniedException } from '@domain/exceptions/domain.exception';
import { UserPrincipal } from '@infrastructure/security/user-principal';

describe('StoreAccessValidator - Unit Tests', () => {
    describe('validateAccess', () => {
        it('should allow admin to access any store', () => {
            const admin = new UserPrincipal('id', 'admin', 'admin@test.com', 'ADMIN', null);

            expect(() => {
                StoreAccessValidator.validateAccess(admin, 'any-store');
            }).not.toThrow();
        });

        it('should allow employee to access their store', () => {
            const employee = new UserPrincipal('id', 'emp', 'emp@test.com', 'EMPLOYEE', 'store-1');

            expect(() => {
                StoreAccessValidator.validateAccess(employee, 'store-1');
            }).not.toThrow();
        });

        it('should deny employee access to other stores', () => {
            const employee = new UserPrincipal('id', 'emp', 'emp@test.com', 'EMPLOYEE', 'store-1');

            expect(() => {
                StoreAccessValidator.validateAccess(employee, 'store-2');
            }).toThrow(AccessDeniedException);
        });
    });

    describe('validateAdminAccess', () => {
        it('should allow admin', () => {
            const admin = new UserPrincipal('id', 'admin', 'admin@test.com', 'ADMIN', null);

            expect(() => {
                StoreAccessValidator.validateAdminAccess(admin);
            }).not.toThrow();
        });

        it('should deny non-admin', () => {
            const employee = new UserPrincipal('id', 'emp', 'emp@test.com', 'EMPLOYEE', 'store-1');

            expect(() => {
                StoreAccessValidator.validateAdminAccess(employee);
            }).toThrow(AccessDeniedException);
        });
    });
});