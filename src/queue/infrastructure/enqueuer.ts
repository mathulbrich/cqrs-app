import { QueueNames } from "@app/queue/infrastructure/queue-names";

export interface EnqueueArguments {
  queue: QueueNames;
  syncId: string;
  payload: string;
}

export abstract class Enqueuer {
  public abstract enqueue(args: EnqueueArguments): Promise<void>;
}
