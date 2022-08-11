/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import "envs/load";
import { Env } from "@app/config/config-envs";
import { DynamoDBTestContainer } from "@test/integration/setup/dynamodb";

(async () => {
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
