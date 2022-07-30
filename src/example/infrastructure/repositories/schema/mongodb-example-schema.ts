import { model, Schema, Document } from 'mongoose';
import { Example } from '@app/example/domain/example';
import { Uuid } from '@app/lib/uuid';

export const EXAMPLE_COLLECTION = 'Example';

interface MongoDBExample extends Document {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export const ExampleSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

export const ExampleModel = model<MongoDBExample>(
  EXAMPLE_COLLECTION,
  ExampleSchema,
);

export const fromDomain = (example: Example) =>
  new ExampleModel({
    id: example.id.toString(),
    name: example.name,
    description: example.description,
    createdAt: example.createdAt,
  });

export const toDomain = (example: MongoDBExample): Example =>
  new Example({
    id: new Uuid(example.id),
    name: example.name,
    description: example.description,
    createdAt: example.createdAt,
  });
