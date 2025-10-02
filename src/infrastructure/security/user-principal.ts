export class UserPrincipal {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly role: string,
    public readonly storeId: string | null
  ) {}

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isEmployee(): boolean {
    return this.role === 'EMPLOYEE';
  }

  canAccessStore(storeId: string): boolean {
    if (this.isAdmin()) return true;
    return this.storeId !== null && this.storeId === storeId;
  }

  static fromUser(user: any): UserPrincipal {
    return new UserPrincipal(
      user.id,
      user.username,
      user.email,
      user.role.name,
      user.storeId
    );
  }
}
