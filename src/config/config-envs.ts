/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { z } from "zod";

import {
  stringToBooleanDisabledByDefault,
  stringToNumber,
  stringToNumberWithDefault,
} from "@app/lib/zod";

export const Env = {
  APP_NAME: "APP_NAME",
  APP_PORT: "APP_PORT",
  DYNAMO_DB_TABLE_NAME: "DYNAMO_DB_TABLE_NAME",
  SQS_QUEUE_BASE_URL: "SQS_QUEUE_BASE_URL",
  SQS_QUEUE_BATCH_CONSUMER_SIZE: "SQS_QUEUE_BATCH_CONSUMER_SIZE",
  SQS_QUEUE_SUFFIX: "SQS_QUEUE_SUFFIX",
} as const;
export type Env = keyof typeof Env;

export const OptionalEnv = {
  DYNAMO_DB_ENDPOINT: "DYNAMO_DB_ENDPOINT",
  LOGGING_ASYNC_MIN_LENGTH: "LOGGING_ASYNC_MIN_LENGTH",
  LOGGING_TYPE: "LOGGING_TYPE",
  LOGGING_LEVEL: "LOGGING_LEVEL",
  NODE_ENV: "NODE_ENV",
  SQS_QUEUE_ENDPOINT: "SQS_QUEUE_ENDPOINT",
  SQS_QUEUE_WAIT_TIME_SECONDS: "SQS_QUEUE_WAIT_TIME_SECONDS",
  USE_IN_MEMORY_REPOSITORY: "USE_IN_MEMORY_REPOSITORY",
} as const;
export type OptionalEnv = keyof typeof OptionalEnv;

export const ConfigEnvs = z.object({
  app: z.object({
    env: z.string().optional(),
    name: z.string().trim().min(1),
    port: stringToNumberWithDefault("3000"),
    useInMemoryRepository: stringToBooleanDisabledByDefault(),
  }),
  logging: z.object({
    type: z
      .string()
      .default("sync")
      .refine((type) => ["async", "sync", "lambda"].includes(type)),
    minLength: stringToNumberWithDefault("4096").optional(),
    level: z.string().default("trace"),
  }),
  queue: z.object({
    sqsQueueBaseUrl: z.string().url(),
    sqsQueueBatchConsumeSize: stringToNumber().default("10"),
    sqsQueueEndpoint: z.string().optional(),
    sqsQueueSuffix: z.string().default(""),
    sqsQueueWaitTimeSeconds: stringToNumber().optional(),
  }),
  dynamoDb: z.object({
    endpoint: z.string().optional(),
    tableName: z.string().default("example"),
  }),
});
export type ConfigEnvs = z.infer<typeof ConfigEnvs>;

const configInput = (
  /* istanbul ignore next */
  inputConfig: Record<string, string | undefined> = process.env,
): z.input<typeof ConfigEnvs> => ({
  app: {
    env: inputConfig[OptionalEnv.NODE_ENV],
    name: inputConfig[Env.APP_NAME]!,
    port: inputConfig[Env.APP_PORT]!,
    useInMemoryRepository: inputConfig[OptionalEnv.USE_IN_MEMORY_REPOSITORY],
  },
  logging: {
    type: inputConfig[OptionalEnv.LOGGING_TYPE],
    minLength: inputConfig[OptionalEnv.LOGGING_ASYNC_MIN_LENGTH],
    level: inputConfig[OptionalEnv.LOGGING_LEVEL],
  },
  queue: {
    sqsQueueBaseUrl: inputConfig[Env.SQS_QUEUE_BASE_URL]!,
    sqsQueueBatchConsumeSize: inputConfig[Env.SQS_QUEUE_BATCH_CONSUMER_SIZE],
    sqsQueueEndpoint: inputConfig[OptionalEnv.SQS_QUEUE_ENDPOINT],
    sqsQueueSuffix: inputConfig[Env.SQS_QUEUE_SUFFIX],
    sqsQueueWaitTimeSeconds: inputConfig[OptionalEnv.SQS_QUEUE_WAIT_TIME_SECONDS],
  },
  dynamoDb: {
    endpoint: inputConfig[OptionalEnv.DYNAMO_DB_ENDPOINT],
    tableName: inputConfig[Env.DYNAMO_DB_TABLE_NAME],
  },
});

export const validateConfig = (config: Record<string, string | undefined>) =>
  ConfigEnvs.parse(configInput(config));
