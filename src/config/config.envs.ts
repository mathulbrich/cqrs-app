/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { z } from 'zod';

export const Env = {
  GCP_QUEUE_HOST: 'GCP_QUEUE_HOST',
  GCP_QUEUE_PORT: 'GCP_QUEUE_PORT',
  GCP_QUEUE_PROJECT: 'GCP_QUEUE_PROJECT',
  GCP_QUEUE_REGION: 'GCP_QUEUE_REGION',
  GCP_QUEUE_HANDLER_URL: 'GCP_QUEUE_HANDLER_URL',
  MONGODB_CONNECTION: 'MONGODB_CONNECTION',
  MONGODB_DATABASE: 'MONGODB_DATABASE',
} as const;

export type Env = keyof typeof Env;

const QueueEnvs = z.object({
  queueHost: z.string(),
  queuePort: z.number(),
  queueProject: z.string(),
  queueRegion: z.string(),
  queueHandlerUrl: z.string().url(),
});
type QueueEnvs = z.infer<typeof QueueEnvs>;

const MongoDBEnvs = z.object({
  mongoConnection: z.string().url(),
  database: z.string(),
});
type MongoDBEnvs = z.infer<typeof MongoDBEnvs>;

const ConfigEnvs = z.object({
  queue: QueueEnvs,
  mongoDb: MongoDBEnvs,
});
type ConfigEnvs = z.infer<typeof ConfigEnvs>;

export const config: ConfigEnvs = {
  queue: {
    queueHost: process.env[Env.GCP_QUEUE_HOST]!,
    queuePort: Number(process.env[Env.GCP_QUEUE_PORT]),
    queueProject: process.env[Env.GCP_QUEUE_PROJECT]!,
    queueRegion: process.env[Env.GCP_QUEUE_REGION]!,
    queueHandlerUrl: process.env[Env.GCP_QUEUE_HANDLER_URL]!,
  },
  mongoDb: {
    mongoConnection: process.env[Env.MONGODB_CONNECTION]!,
    database: process.env[Env.MONGODB_DATABASE]!,
  },
};

export const checkEnvs = () => {
  ConfigEnvs.parse(config);
};
