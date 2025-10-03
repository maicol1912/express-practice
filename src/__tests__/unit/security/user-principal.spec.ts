import { UserPrincipal } from '@infrastructure/security/user-principal';

describe('UserPrincipal - Unit Tests', () => {
    describe('isAdmin', () => {
        it('should return true for admin role', () => {
            const principal = new UserPrincipal('id', 'admin', 'admin@test.com', 'ADMIN', null);
            expect(principal.isAdmin()).toBe(true);
        });

        it('should return false for non-admin role', () => {
            const principal = new UserPrincipal('id', 'user', 'user@test.com', 'EMPLOYEE', null);
            expect(principal.isAdmin()).toBe(false);
        });
    });

    describe('isEmployee', () => {
        it('should return true for employee role', () => {
            const principal = new UserPrincipal('id', 'emp', 'emp@test.com', 'EMPLOYEE', 'store-1');
            expect(principal.isEmployee()).toBe(true);
        });
    });

    describe('canAccessStore', () => {
        it('should allow admin to access any store', () => {
            const principal = new UserPrincipal('id', 'admin', 'admin@test.com', 'ADMIN', null);
            expect(principal.canAccessStore('any-store')).toBe(true);
        });

        it('should allow employee to access their store', () => {
            const principal = new UserPrincipal('id', 'emp', 'emp@test.com', 'EMPLOYEE', 'store-1');
            expect(principal.canAccessStore('store-1')).toBe(true);
        });

        it('should deny employee access to other stores', () => {
            const principal = new UserPrincipal('id', 'emp', 'emp@test.com', 'EMPLOYEE', 'store-1');
            expect(principal.canAccessStore('store-2')).toBe(false);
        });
    });

    describe('fromUser', () => {
        it('should create UserPrincipal from user object', () => {
            const user = {
                id: 'user-1',
                username: 'testuser',
                email: 'test@example.com',
                role: { name: 'EMPLOYEE' },
                storeId: 'store-1'
            };

            const principal = UserPrincipal.fromUser(user);

            expect(principal.id).toBe('user-1');
            expect(principal.username).toBe('testuser');
            expect(principal.role).toBe('EMPLOYEE');
            expect(principal.storeId).toBe('store-1');
        });
    });
});