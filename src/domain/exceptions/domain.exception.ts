export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly errorCode: string = 'DOMAIN_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundException extends DomainException {
  constructor(resource: string, parameter: string, value: string) {
    super(
      `${resource} not found with ${parameter}: ${value}`,
      404,
      'RESOURCE_NOT_FOUND'
    );
  }
}

export class InsufficientStockException extends DomainException {
  constructor(
    public readonly productId: string,
    public readonly storeId: string,
    public readonly requested: number,
    public readonly available: number
  ) {
    super(
      `Insufficient stock for product ${productId} at store ${storeId}. Requested: ${requested}, Available: ${available}`,
      409,
      'INSUFFICIENT_STOCK'
    );
  }
}

export class InvalidReservationException extends DomainException {
  constructor(message: string) {
    super(message, 400, 'INVALID_RESERVATION');
  }
}

export class AlreadyExistsException extends DomainException {
  constructor(resource: string, field: string, value: string) {
    super(
      `${resource} already exists with ${field}: ${value}`,
      409,
      'ALREADY_EXISTS'
    );
  }
}

export class LockAcquisitionException extends DomainException {
  constructor(lockKey: string) {
    super(
      `Could not acquire distributed lock: ${lockKey}`,
      503,
      'LOCK_ACQUISITION_FAILED'
    );
  }
}

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }
}

export class TokenExpiredException extends DomainException {
  constructor() {
    super('Token has expired', 401, 'TOKEN_EXPIRED');
  }
}

export class AccessDeniedException extends DomainException {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'ACCESS_DENIED');
  }
}

export class InventoryInconsistencyException extends DomainException {
  constructor(message: string) {
    super(message, 500, 'INVENTORY_INCONSISTENCY');
  }
}

export class InventoryOperationException extends DomainException {
  constructor(message: string) {
    super(message, 500, 'INVENTORY_OPERATION_FAILED');
  }
}

export class ValidateDomainException extends DomainException {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class InvalidStateException extends DomainException {
  constructor(message: string) {
    super(message, 400, 'INVALID_STATE');
  }
}
