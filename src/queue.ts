/* eslint-disable @typescript-eslint/no-floating-promises */
import "source-map-support/register";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { bootstrapStandaloneApp } from "@app/bootstrap";
import { validateConfig, Env } from "@app/common/config/config-envs";
import { SQS_QUEUE_CONTEXT } from "@app/constants";
import { SQSListener } from "@app/queue/managed/sqs-listener";
import { StandaloneModule } from "@app/standalone.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (config) =>
        validateConfig({
          ...config,
          [Env.APP_NAME]: SQS_QUEUE_CONTEXT,
        }),
    }),
    StandaloneModule,
  ],
})
class ListenQueueModule {}

(async () => {
  const app = await bootstrapStandaloneApp(ListenQueueModule);

  const executionQueue = await app.resolve(SQSListener);
  await executionQueue.listenQueues();
})();
