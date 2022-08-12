export abstract class Event {}

export abstract class EventPublisher {
  abstract publish<T extends Event>(event: T): Promise<void>;
}
