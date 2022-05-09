import { Baseclass } from '@app/lib/baseclass';

export interface CreateExampleCommandAttributes {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export class CreateExampleCommand extends Baseclass<CreateExampleCommandAttributes>() {
  public constructor(attributes: CreateExampleCommandAttributes) {
    super(attributes);
  }
}
