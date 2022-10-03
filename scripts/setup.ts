/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import envs from "@test/load-envs";

import { DynamoDBTestContainer } from "@test/integration/setup/dynamodb";

(async () => {
  const container = new DynamoDBTestContainer(envs.dynamoDb.tableName);
  if (await container.tableExists()) {
    console.log("Table already created!");
    return;
  }

  await container
    .setUp()
    .then(() => console.log("DynamoDB table created successfully!"))
    .catch((e) => console.error("Error creating DynamoDB table!", e));
})();
