import { QueueName } from "@app/queue/application/queue-names";

export interface EnqueueArguments {
  groupId?: string;
  messageId?: string;
  payload: string;
  queue: QueueName;
}

export abstract class Enqueuer {
  abstract enqueue(args: EnqueueArguments): Promise<void>;
}
