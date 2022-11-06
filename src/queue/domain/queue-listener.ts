export abstract class QueueListener {
  abstract execute(data: unknown): Promise<void>;
}
