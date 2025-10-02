import { injectable, inject } from 'tsyringe';
import { AuthenticationUseCase, LoginResponse } from '@domain/ports/in/authentication.use-case';
import { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import { InvalidCredentialsException } from '@domain/exceptions/domain.exception';
import { JwtService, JwtPayload } from '@infrastructure/security/jwt.service';
import { PasswordUtil } from '@shared/utils/password.util';
import { logger } from '@infrastructure/config/logger.config';

@injectable()
export class AuthenticationService implements AuthenticationUseCase {
  private jwtService: JwtService;

  constructor(@inject('UserRepositoryPort') private userRepository: UserRepositoryPort) {
    this.jwtService = new JwtService();
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    logger.info('Login attempt', { username });

    // Find user
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Verify password
    const isValid = await PasswordUtil.compare(password, user.password);
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    // Check if user is active
    if (!user.isActive) {
      throw new InvalidCredentialsException();
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Create JWT payload
    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role.name,
      storeId: user.storeId,
    };

    // Generate tokens
    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    logger.info('Login successful', { userId: user.id });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1 hour in seconds
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        storeId: user.storeId,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    logger.info('Refresh token attempt');

    // Verify refresh token
    const decoded = await this.jwtService.verifyRefreshToken(refreshToken);

    // Find user
    const user = await this.userRepository.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new InvalidCredentialsException();
    }

    // Create new tokens
    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role.name,
      storeId: user.storeId,
    };

    const accessToken = this.jwtService.generateAccessToken(payload);
    const newRefreshToken = this.jwtService.generateRefreshToken(payload);

    logger.info('Token refreshed', { userId: user.id });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        storeId: user.storeId,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    logger.info('Logout', { userId });
    // In a real application, you might want to blacklist the token
    // For now, just log the event
  }
}
