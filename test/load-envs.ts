import { config } from "dotenv";
import { merge } from "lodash";

import { AppConfigService } from "@app/common/config/app-config-service";
import { OptionalEnv, validateConfig } from "@app/common/config/config-envs";
import { Subset } from "@app/lib/subset";

const load = () => {
  config({ path: `env/${process.env[OptionalEnv.NODE_ENV]}.env` });
  return validateConfig();
};

const envs = load();

export default envs;

export const reassignEnvs = (partial: Partial<Subset<AppConfigService>>): AppConfigService => {
  return merge({}, envs, partial);
};
