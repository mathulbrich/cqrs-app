import { Example } from "@app/example/domain/example";

export class ExampleCreatedEvent {
  constructor(readonly example: Example) {}
}
