export class ApiResponse<T> {
  constructor(
    public success: boolean,
    public data?: T,
    public message?: string,
    public errors?: string[]
  ) { }

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  static error<T = never>(message: string, errors?: string[]): ApiResponse<T> {
    return new ApiResponse<T>(false, undefined, message, errors);
  }
}

export class PageResponse<T> {
  constructor(
    public data: T[],
    public total: number,
    public page: number,
    public size: number,
    public totalPages: number
  ) { }

  static create<T>(data: T[], total: number, page: number, size: number): PageResponse<T> {
    return new PageResponse(data, total, page, size, Math.ceil(total / size));
  }
}
