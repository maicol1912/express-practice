import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '@infrastructure/config/database.config';
import { RoleRepositoryPort } from '@domain/ports/out/role-repository.port';
import { Role, RoleName } from '@domain/models/role.model';
import { RoleEntity } from '../entities/role.entity';

@injectable()
export class RoleRepository implements RoleRepositoryPort {
  private repository: Repository<RoleEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(RoleEntity);
  }

  async findById(id: string): Promise<Role | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByName(name: RoleName): Promise<Role | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findAll(): Promise<Role[]> {
    const entities = await this.repository.find({
      order: { name: 'ASC' },
    });
    return entities.map((e) => this.entityToDomain(e));
  }

  private entityToDomain(entity: RoleEntity): Role {
    return new Role(
      entity.id,
      entity.name as RoleName,
      entity.description
    );
  }
}
