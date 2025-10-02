import { AccessDeniedException } from '@domain/exceptions/domain.exception';
import { UserPrincipal } from './user-principal';

export class StoreAccessValidator {
  static validateAccess(user: UserPrincipal, storeId: string): void {
    if (!user.canAccessStore(storeId)) {
      throw new AccessDeniedException(
        `User ${user.username} does not have access to store ${storeId}`
      );
    }
  }

  static validateAdminAccess(user: UserPrincipal): void {
    if (!user.isAdmin()) {
      throw new AccessDeniedException(
        `User ${user.username} does not have admin privileges`
      );
    }
  }
}
