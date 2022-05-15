import { BadRequestException, PipeTransform, UsePipes } from '@nestjs/common';
import { ZodType } from 'zod';

export const ValidateSchema = (schema: ZodType) =>
  UsePipes(new SchemaValidationPipe(schema));

export class SchemaValidationPipe implements PipeTransform {
  public constructor(private readonly schema: ZodType) {}

  public transform(value: unknown): unknown {
    if (!this.schema.safeParse(value).success) {
      throw new BadRequestException();
    }
    return value;
  }
}
