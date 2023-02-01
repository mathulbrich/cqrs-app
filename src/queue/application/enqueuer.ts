import { QueueName } from "@app/queue/application/queue-names";

export interface EnqueueArguments {
  groupId?: string;
  messageId?: string;
  payload: string | object;
  queue: QueueName;
  delaySeconds?: number;
}

export abstract class Enqueuer {
  abstract enqueue(args: EnqueueArguments): Promise<void>;
}
