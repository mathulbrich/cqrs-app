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
  MONGODB_CONNECTION_URI: "MONGODB_CONNECTION_URI",
  SQS_QUEUE_BASE_URL: "SQS_QUEUE_BASE_URL",
  SQS_QUEUE_BATCH_CONSUMER_SIZE: "SQS_QUEUE_BATCH_CONSUMER_SIZE",
  SQS_QUEUE_SUFFIX: "SQS_QUEUE_SUFFIX",
} as const;
export type Env = keyof typeof Env;

export const OptionalEnv = {
  LOGGING_ASYNC_MIN_LENGTH: "LOGGING_ASYNC_MIN_LENGTH",
  LOGGING_ASYNC: "LOGGING_ASYNC",
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
    port: stringToNumber(),
    useInMemoryRepository: stringToBooleanDisabledByDefault(),
  }),
  logging: z.object({
    async: stringToBooleanDisabledByDefault(),
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
  mongoDb: z.object({
    connectionUri: z.string().url(),
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
    async: inputConfig[OptionalEnv.LOGGING_ASYNC],
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
  mongoDb: {
    connectionUri: inputConfig[Env.MONGODB_CONNECTION_URI]!,
  },
});

export const validateConfig = (config: Record<string, string | undefined>) =>
  ConfigEnvs.parse(configInput(config));
