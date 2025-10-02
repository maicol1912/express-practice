import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '@infrastructure/config/database.config';
import { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import { User } from '@domain/models/user.model';
import { Role, RoleName } from '@domain/models/role.model';
import { UserEntity } from '../entities/user.entity';

@injectable()
export class UserRepository implements UserRepositoryPort {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  async save(user: User): Promise<User> {
    const entity = this.domainToEntity(user);
    const saved = await this.repository.save(entity);
    // Reload with role relation
    const reloaded = await this.repository.findOne({
      where: { id: saved.id },
      relations: ['role'],
    });
    if (!reloaded) {
      throw new Error('Failed to reload saved user');
    }
    return this.entityToDomain(reloaded);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['role'],
    });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { username },
      relations: ['role'],
    });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { email },
      relations: ['role'],
    });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByStore(storeId: string): Promise<User[]> {
    const entities = await this.repository.find({
      where: { storeId },
      relations: ['role'],
    });
    return entities.map((e) => this.entityToDomain(e));
  }

  async findByRole(roleName: string): Promise<User[]> {
    const entities = await this.repository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.role', 'role')
      .where('role.name = :roleName', { roleName })
      .getMany();

    return entities.map((e) => this.entityToDomain(e));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private domainToEntity(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.username = domain.username;
    entity.email = domain.email;
    entity.password = domain.password;
    entity.roleId = domain.role.id;
    entity.storeId = domain.storeId;
    entity.isActive = domain.isActive;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.lastLoginAt = domain.lastLoginAt;
    return entity;
  }

  private entityToDomain(entity: UserEntity): User {
    const role = new Role(
      entity.role.id,
      entity.role.name as RoleName,
      entity.role.description
    );

    return new User(
      entity.id,
      entity.username,
      entity.email,
      entity.password,
      role,
      entity.storeId,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
      entity.lastLoginAt
    );
  }
}
