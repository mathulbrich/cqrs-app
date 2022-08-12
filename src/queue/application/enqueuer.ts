import { QueueNames } from "@app/queue/application/queue-names";

export interface EnqueueArguments {
  groupId?: string;
  messageId: string;
  payload: string;
  queue: QueueNames;
}

export abstract class Enqueuer {
  abstract enqueue(args: EnqueueArguments): Promise<void>;
}
