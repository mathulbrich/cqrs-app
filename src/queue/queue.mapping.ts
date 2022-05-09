import { Newable } from '@app/lib/newable';
import { CreateExampleQueueHandler } from '@app/example/application/queues/create-example-queue.handler';

type QueueHandler = Newable<{ execute(data: unknown): Promise<void> }>;

export const QueueNames = ['create-example'] as const;
export type QueueNames = typeof QueueNames[number];

export const QueueMapping: Record<QueueNames, QueueHandler> = {
  ['create-example']: CreateExampleQueueHandler,
};

export const isValidQueue = (queueName: string): queueName is QueueNames =>
  QueueNames.includes(queueName as QueueNames);
