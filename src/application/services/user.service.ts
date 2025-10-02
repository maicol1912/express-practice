import { injectable, inject } from 'tsyringe';
import { UserUseCase } from '@domain/ports/in/user.use-case';
import { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import { RoleRepositoryPort } from '@domain/ports/out/role-repository.port';
import { StoreRepositoryPort } from '@domain/ports/out/store-repository.port';
import { User } from '@domain/models/user.model';
import { NotFoundException, AlreadyExistsException, ValidateDomainException } from '@domain/exceptions/domain.exception';
import { PasswordUtil } from '@shared/utils/password.util';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@infrastructure/config/logger.config';

@injectable()
export class UserService implements UserUseCase {
  constructor(
    @inject('UserRepositoryPort') private userRepository: UserRepositoryPort,
    @inject('RoleRepositoryPort') private roleRepository: RoleRepositoryPort,
    @inject('StoreRepositoryPort') private storeRepository: StoreRepositoryPort
  ) { }

  async create(
    username: string,
    email: string,
    password: string,
    roleId: string,
    storeId?: string
  ): Promise<User> {
    logger.info('Creating user', { username, email, roleId });

    // Check if username exists
    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      throw new AlreadyExistsException('User', 'username', username);
    }

    // Check if email exists
    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new AlreadyExistsException('User', 'email', email);
    }

    // Validate role
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role', 'id', roleId);
    }

    // Validate store if provided
    if (storeId) {
      const store = await this.storeRepository.findById(storeId);
      if (!store) {
        throw new NotFoundException('Store', 'id', storeId);
      }
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(password);

    const user = new User(
      uuidv4(),
      username,
      email,
      hashedPassword,
      role,
      storeId || null,
      true,
      new Date(),
      new Date(),
      null
    );

    return this.userRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User', 'id', id);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async updateProfile(id: string, email?: string, storeId?: string): Promise<User> {
    const user = await this.findById(id);

    if (email && email !== user.email) {
      const existing = await this.userRepository.findByEmail(email);
      if (existing) {
        throw new AlreadyExistsException('User', 'email', email);
      }
      user.email = email;
    }

    if (storeId && storeId !== user.storeId) {
      const store = await this.storeRepository.findById(storeId);
      if (!store) {
        throw new NotFoundException('Store', 'id', storeId);
      }
      user.storeId = storeId;
    }

    user.updatedAt = new Date();
    return this.userRepository.save(user);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);

    const isValid = await PasswordUtil.compare(currentPassword, user.password);
    if (!isValid) {
      throw new ValidateDomainException('Current password is incorrect');
    }

    user.password = await PasswordUtil.hash(newPassword);
    user.updatedAt = new Date();
    await this.userRepository.save(user);

    logger.info('Password changed', { userId: id });
  }

  async assignStore(id: string, storeId: string): Promise<User> {
    const user = await this.findById(id);

    const store = await this.storeRepository.findById(storeId);
    if (!store) {
      throw new NotFoundException('Store', 'id', storeId);
    }

    user.storeId = storeId;
    user.updatedAt = new Date();
    return this.userRepository.save(user);
  }

  async activate(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = true;
    user.updatedAt = new Date();
    return this.userRepository.save(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = false;
    user.updatedAt = new Date();
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.delete(user.id);
    logger.info('User deleted', { id });
  }

  async listByStore(storeId: string): Promise<User[]> {
    const store = await this.storeRepository.findById(storeId);
    if (!store) {
      throw new NotFoundException('Store', 'id', storeId);
    }
    return this.userRepository.findByStore(storeId);
  }

  async listEmployees(): Promise<User[]> {
    return this.userRepository.findByRole('EMPLOYEE');
  }

  async listAdmins(): Promise<User[]> {
    return this.userRepository.findByRole('ADMIN');
  }
}
