import { CreateExampleQueueListener } from "@app/example/application/queues/create-example-queue-listener";
import { Newable } from "@app/lib/newable";
import { InternalQueue, InternalQueues } from "@app/queue/application/queue-names";
import { QueueListener } from "@app/queue/domain/queue-listener";

type QueueStructure = { listener: Newable<QueueListener>; type: "fifo" | "standard" };

export const QueueMapping: { [key in InternalQueue]: QueueStructure } = {
  "create-example": { listener: CreateExampleQueueListener, type: "fifo" },
};

export const isValidQueue = (queueName: string): queueName is InternalQueue =>
  InternalQueues.includes(queueName as InternalQueue);

export const queueTypeSuffixFactory = {
  fifo: ".fifo",
  standard: "",
} as const;
