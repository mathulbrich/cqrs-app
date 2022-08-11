/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { config } from "dotenv";

import { Env, OptionalEnv } from "@app/config/config-envs";
import { DynamoDBTestContainer } from "@test/integration/setup/dynamodb";

(async () => {
  config({ path: `env/${process.env[OptionalEnv.NODE_ENV]}.env` });
  const container = new DynamoDBTestContainer(process.env[Env.DYNAMO_DB_TABLE_NAME]);
  if (await container.tableExists()) {
    console.log("Table already created!");
    return;
  }

  await container
    .setUp()
    .then(() => console.log("DynamoDB table created successfully!"))
    .catch((e) => console.error("Error creating DynamoDB table!", e));
})();
