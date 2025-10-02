import { User } from '../../models/user.model';

export interface UserUseCase {
  create(
    username: string,
    email: string,
    password: string,
    roleId: string,
    storeId?: string
  ): Promise<User>;

  findById(id: string): Promise<User>;

  findByUsername(username: string): Promise<User | null>;

  updateProfile(
    id: string,
    email?: string,
    storeId?: string
  ): Promise<User>;

  changePassword(id: string, currentPassword: string, newPassword: string): Promise<void>;

  assignStore(id: string, storeId: string): Promise<User>;

  activate(id: string): Promise<User>;

  deactivate(id: string): Promise<User>;

  delete(id: string): Promise<void>;

  listByStore(storeId: string): Promise<User[]>;

  listEmployees(): Promise<User[]>;

  listAdmins(): Promise<User[]>;
}
