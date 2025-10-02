import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export async function validateDto<T extends object>(
  dtoClass: new () => T,
  plain: object
): Promise<T> {
  const dtoInstance = plainToClass(dtoClass, plain);
  const errors: ValidationError[] = await validate(dtoInstance);

  if (errors.length > 0) {
    const messages = errors.map((error) => Object.values(error.constraints || {}).join(', '));
    throw new Error(`Validation failed: ${messages.join('; ')}`);
  }

  return dtoInstance;
}
