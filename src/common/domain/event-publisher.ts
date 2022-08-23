export abstract class EventPublisher {
  abstract publish<T extends object>(event: T): Promise<void>;
}
