import { CreateExampleQueueHandler } from "@app/example/application/queues/create-example-queue.handler";
import { Newable } from "@app/lib/newable";
import { QueueNames } from "@app/queue/application/queue-names";

type QueueHandler = Newable<{ execute(data: unknown): Promise<void> }>;

export const QueueMapping: Record<QueueNames, QueueHandler> = {
  "create-example": CreateExampleQueueHandler,
};

export const isValidQueue = (queueName: string): queueName is QueueNames =>
  QueueNames.includes(queueName as QueueNames);
