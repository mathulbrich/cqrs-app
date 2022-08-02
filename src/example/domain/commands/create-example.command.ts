import { BaseClass } from '@app/lib/baseclass';
import { Uuid } from '@app/lib/uuid';

export interface CreateExampleCommandAttributes {
  readonly id: Uuid;
  readonly name: string;
  readonly description: string;
}

export class CreateExampleCommand extends BaseClass<CreateExampleCommandAttributes>() {
  public constructor(attributes: CreateExampleCommandAttributes) {
    super(attributes);
  }
}
