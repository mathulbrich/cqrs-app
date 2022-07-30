import { Logger } from '@nestjs/common';
import {
  ConfigEnvs,
  configInput,
  ConfigurationOutput,
} from '@app/config/config-envs';

const parsedConfig = ConfigEnvs.safeParse(configInput);
export const config = (parsedConfig as { data: ConfigurationOutput }).data;

export const validateConfig = () => {
  if (!parsedConfig.success) {
    Logger.error('Environment variables are not valid');
    Logger.error(parsedConfig.error.message);
    process.exit(1);
  }
};

validateConfig();
