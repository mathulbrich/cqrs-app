// import { Logger } from '@nestjs/common';
import { ConfigEnvs, configInput } from '@app/config/config-envs';
import { Logger } from '@nestjs/common';

export const validateConfig = (config: Record<string, string | undefined>) => {
  const parsed = ConfigEnvs.safeParse(configInput(config));
  if (!parsed.success) {
    Logger.error('Environment variables is invalid');
    throw new Error(parsed.error.message);
  }
  return parsed.data;
};
