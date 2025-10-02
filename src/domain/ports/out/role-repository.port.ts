import { Role, RoleName } from '../../models/role.model';

export interface RoleRepositoryPort {
  findById(id: string): Promise<Role | null>;

  findByName(name: RoleName): Promise<Role | null>;

  findAll(): Promise<Role[]>;
}
