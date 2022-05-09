import { Baseclass } from '@app/lib/baseclass';

interface ExampleAttributes {
  id: string;
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
