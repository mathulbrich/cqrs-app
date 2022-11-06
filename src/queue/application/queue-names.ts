export const InternalQueues = ["create-example"] as const;
export type InternalQueue = typeof QueueNames[number];

export const QueueNames = [...InternalQueues];
export type QueueName = typeof QueueNames[number];
