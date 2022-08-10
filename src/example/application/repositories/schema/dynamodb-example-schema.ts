import { z } from "zod";

import { Example } from "@app/example/domain/example";
import { Uuid } from "@app/lib/uuid";

export const DynamoDBExampleSchema = z.object({
  PK: z.string(),
  SK: z.string(),
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
});

export type DynamoDBExampleSchema = z.infer<typeof DynamoDBExampleSchema>;

export const examplePk = () => `TYPE#EXAMPLE`;
export const exampleSk = (id: Uuid) => `EXAMPLE#${id.toString().toUpperCase()}`;

export const fromDomain = (example: Example): DynamoDBExampleSchema => ({
  PK: examplePk(),
  SK: exampleSk(example.id),
  id: example.id.toString(),
  name: example.name,
  description: example.description,
  createdAt: example.createdAt.toISOString(),
});

export const toDomain = (schema: DynamoDBExampleSchema): Example => ({
  id: new Uuid(schema.id),
  name: schema.name,
  description: schema.description,
  createdAt: new Date(schema.createdAt),
});
