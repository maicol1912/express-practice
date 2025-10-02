import { Role, RoleName } from './role.model';

export class User {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public password: string,
    public role: Role,
    public storeId: string | null,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public lastLoginAt: Date | null
  ) {}

  isAdmin(): boolean {
    return this.role.name === RoleName.ADMIN;
  }

  isEmployee(): boolean {
    return this.role.name === RoleName.EMPLOYEE;
  }

  canAccessStore(storeId: string): boolean {
    if (this.isAdmin()) return true;
    return this.storeId !== null && this.storeId === storeId;
  }
}
