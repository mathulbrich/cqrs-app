/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { parseInt } from "lodash";
import validator from "validator";
import { z } from "zod";

export const Env = {
  APP_NAME: "APP_NAME",
  APP_PORT: "APP_PORT",
  GCP_QUEUE_HOST: "GCP_QUEUE_HOST",
  GCP_QUEUE_PORT: "GCP_QUEUE_PORT",
  GCP_QUEUE_PROJECT: "GCP_QUEUE_PROJECT",
  GCP_QUEUE_REGION: "GCP_QUEUE_REGION",
  GCP_QUEUE_HANDLER_URL: "GCP_QUEUE_HANDLER_URL",
  MONGODB_CONNECTION_URI: "MONGODB_CONNECTION_URI",
} as const;
export type Env = keyof typeof Env;

export const OptionalEnv = {
  NODE_ENV: "NODE_ENV",
  LOGGING_ASYNC: "LOGGING_ASYNC",
  LOGGING_ASYNC_MIN_LENGTH: "LOGGING_ASYNC_MIN_LENGTH",
  LOGGING_LEVEL: "LOGGING_LEVEL",
  USE_IN_MEMORY_REPOSITORY: "USE_IN_MEMORY_REPOSITORY",
} as const;
type OptionalEnv = keyof typeof OptionalEnv;

const DECIMAL_RADIX = 10;

const stringToBooleanDisabledByDefault = () =>
  z
    .string()
    .refine(validator.isBoolean)
    .default("0")
    .transform((data) => validator.toBoolean(data));

export const stringToNumberWithDefault = (def: string) =>
  z
    .string()
    .default(def)
    .transform((n) => parseInt(n, DECIMAL_RADIX));

const stringToNumber = () =>
  z.string().transform((data) => parseInt(data, DECIMAL_RADIX));

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
    queueHost: z.string(),
    queuePort: stringToNumber(),
    queueProject: z.string(),
    queueRegion: z.string(),
    queueHandlerUrl: z.string().url(),
  }),
  mongoDb: z.object({
    connectionUri: z.string().url(),
  }),
});
export type ConfigEnvs = z.infer<typeof ConfigEnvs>;

const configInput = (
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
    queueHost: inputConfig[Env.GCP_QUEUE_HOST]!,
    queuePort: inputConfig[Env.GCP_QUEUE_PORT]!,
    queueProject: inputConfig[Env.GCP_QUEUE_PROJECT]!,
    queueRegion: inputConfig[Env.GCP_QUEUE_REGION]!,
    queueHandlerUrl: inputConfig[Env.GCP_QUEUE_HANDLER_URL]!,
  },
  mongoDb: {
    connectionUri: inputConfig[Env.MONGODB_CONNECTION_URI]!,
  },
});

export const validateConfig = (config: Record<string, string | undefined>) =>
  ConfigEnvs.parse(configInput(config));
