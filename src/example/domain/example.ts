import { Baseclass } from '@app/lib/baseclass';
import { Uuid } from '@app/lib/uuid';

export interface ExampleAttributes {
  id: Uuid;
  name: string;
  description: string;
  createdAt: Date;
}

type RequiredExampleAttributes = Partial<ExampleAttributes> &
  Omit<ExampleAttributes, 'createdAt'>;

export class Example extends Baseclass<RequiredExampleAttributes>() {
  constructor(attributes: RequiredExampleAttributes) {
    super({
      createdAt: new Date(),
      ...attributes,
    });
  }
}
