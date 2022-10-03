import { config } from "dotenv";

import { OptionalEnv, validateConfig } from "@app/common/config/config-envs";

const load = () => {
  config({ path: `env/${process.env[OptionalEnv.NODE_ENV]}.env` });
  return validateConfig();
};

export default load();
