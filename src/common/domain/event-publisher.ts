export abstract class Event {}

export abstract class EventPublisher {
  public abstract publish<T extends Event>(event: T): Promise<void>;
}
