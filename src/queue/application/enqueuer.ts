import { XOR } from "@app/lib/xor";
import { QueueName } from "@app/queue/application/queue-names";

export interface EnqueueArguments {
  groupId?: string;
  messageId?: string;
  payload: string | object;
  queue: QueueName;
  delaySeconds?: number;
}

export interface EnqueueBatchArguments {
  queue: QueueName;
  messages: Omit<EnqueueArguments, "queue">[];
}

export abstract class Enqueuer {
  abstract enqueue(args: XOR<EnqueueArguments, EnqueueBatchArguments>): Promise<void>;
}
