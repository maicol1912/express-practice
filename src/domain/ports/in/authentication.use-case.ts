export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    storeId: string | null;
  };
}

export interface AuthenticationUseCase {
  login(username: string, password: string): Promise<LoginResponse>;

  refreshToken(refreshToken: string): Promise<LoginResponse>;

  logout(userId: string): Promise<void>;
}
