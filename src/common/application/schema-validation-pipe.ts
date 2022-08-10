import { BadRequestException, PipeTransform, UsePipes } from "@nestjs/common";
import { ZodType } from "zod";

export const ValidateSchema = (schema: ZodType) => UsePipes(withValidation(schema));

export const withValidation = (schema: ZodType) => new SchemaValidationPipe(schema);

export class SchemaValidationPipe implements PipeTransform {
  public constructor(private readonly schema: ZodType) {}

  public transform(value: unknown): unknown {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    return value;
  }
}
