import { config } from "dotenv";

import { OptionalEnv } from "@app/config/config-envs";

config({ path: `env/${process.env[OptionalEnv.NODE_ENV]}.env` });
