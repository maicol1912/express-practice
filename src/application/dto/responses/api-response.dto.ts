export class ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: Date;

  constructor(success: boolean, data?: T, message?: string, error?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
    this.timestamp = new Date();
  }

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse<T>(true, data, message);
  }

  static error<T = any>(error: string, message?: string): ApiResponse<T> {
    return new ApiResponse<T>(false, undefined, message, error);
  }
}
