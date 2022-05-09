import { Example } from '@app/example/domain/example';

export class ExampleCreatedEvent {
  public constructor(public readonly example: Example) {}
}
