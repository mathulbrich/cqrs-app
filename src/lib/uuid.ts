import { randomUUID } from "crypto";

import { z } from "zod";

export const UuidSchema = z.string().uuid();

export class Uuid {
  private readonly uuid: string;

  constructor(uuid: string) {
    this.uuid = UuidSchema.parse(uuid);
  }

  static generate(): Uuid {
    return new Uuid(randomUUID());
  }

  equals(other: Uuid): boolean {
    return this.uuid === other.uuid;
  }

  toString(): string {
    return this.uuid;
  }
}
