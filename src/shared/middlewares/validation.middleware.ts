import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidateDomainException } from '@domain/exceptions/domain.exception';

export function validationMiddleware<T extends object>(
  type: new () => T,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const dto = plainToClass(type, req[source]);
    const errors: ValidationError[] = await validate(dto);

    if (errors.length > 0) {
      const messages = errors
        .map((error: ValidationError) => Object.values(error.constraints || {}))
        .flat();

      next(new ValidateDomainException(messages.join(', ')));
    } else {
      req[source] = dto;
      next();
    }
  };
}
