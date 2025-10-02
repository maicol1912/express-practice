export class LoginResponseDTO {
  accessToken!: string;
  refreshToken!: string;
  tokenType: string = 'Bearer';
  expiresIn!: number;
  user?: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
  };
}
