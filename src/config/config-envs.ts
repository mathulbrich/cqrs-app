/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { z } from 'zod';
import validator from 'validator';

export const Env = {
  APP_PORT: 'APP_PORT',
  GCP_QUEUE_HOST: 'GCP_QUEUE_HOST',
  GCP_QUEUE_PORT: 'GCP_QUEUE_PORT',
  GCP_QUEUE_PROJECT: 'GCP_QUEUE_PROJECT',
  GCP_QUEUE_REGION: 'GCP_QUEUE_REGION',
  GCP_QUEUE_HANDLER_URL: 'GCP_QUEUE_HANDLER_URL',
  MONGODB_CONNECTION_URI: 'MONGODB_CONNECTION_URI',
} as const;
export type Env = keyof typeof Env;

export const OptionalEnv = {
  USE_IN_MEMORY_REPOSITORY: 'USE_IN_MEMORY_REPOSITORY',
} as const;
type OptionalEnv = keyof typeof OptionalEnv;

const booleanStringDisabledByDefault = z
  .string()
  .refine(validator.isBoolean)
  .default('0')
  .transform((data) => validator.toBoolean(data));

const AppEnvs = z.object({
  port: z.number(),
  useInMemoryRepository: booleanStringDisabledByDefault,
});
type AppEnvs = z.infer<typeof AppEnvs>;

const QueueEnvs = z.object({
  queueHost: z.string(),
  queuePort: z.number(),
  queueProject: z.string(),
  queueRegion: z.string(),
  queueHandlerUrl: z.string().url(),
});
type QueueEnvs = z.infer<typeof QueueEnvs>;

const MongoDBEnvs = z.object({
  connectionUri: z.string().url(),
});
type MongoDBEnvs = z.infer<typeof MongoDBEnvs>;

export const ConfigEnvs = z.object({
  app: AppEnvs,
  queue: QueueEnvs,
  mongoDb: MongoDBEnvs,
});
export type ConfigEnvs = z.infer<typeof ConfigEnvs>;

export type ConfigurationInput = z.input<typeof ConfigEnvs>;
export type ConfigurationOutput = z.output<typeof ConfigEnvs>;

export const configInput = (
  inputConfig: Record<string, string | undefined> = process.env,
): ConfigurationInput => ({
  app: {
    port: Number(inputConfig[Env.APP_PORT]),
    useInMemoryRepository: inputConfig[OptionalEnv.USE_IN_MEMORY_REPOSITORY],
  },
  queue: {
    queueHost: inputConfig[Env.GCP_QUEUE_HOST]!,
    queuePort: Number(inputConfig[Env.GCP_QUEUE_PORT]),
    queueProject: inputConfig[Env.GCP_QUEUE_PROJECT]!,
    queueRegion: inputConfig[Env.GCP_QUEUE_REGION]!,
    queueHandlerUrl: inputConfig[Env.GCP_QUEUE_HANDLER_URL]!,
  },
  mongoDb: {
    connectionUri: inputConfig[Env.MONGODB_CONNECTION_URI]!,
  },
});
