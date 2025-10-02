import { User } from '../../models/user.model';

export interface UserRepositoryPort {
  save(user: User): Promise<User>;

  findById(id: string): Promise<User | null>;

  findByUsername(username: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findByStore(storeId: string): Promise<User[]>;

  findByRole(roleName: string): Promise<User[]>;

  delete(id: string): Promise<void>;
}
