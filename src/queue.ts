/* eslint-disable @typescript-eslint/no-floating-promises */
import "source-map-support/register";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppModule } from "@app/app.module";
import { bootstrapStandaloneApp } from "@app/bootstrap";
import { validateConfig, Env } from "@app/common/config/config-envs";
import { SQS_QUEUE_CONTEXT } from "@app/constants";
import { SQSListener } from "@app/queue/application/sqs-listener";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (config) =>
        validateConfig({
          ...config,
          [Env.APP_NAME]: SQS_QUEUE_CONTEXT,
        }),
    }),
    AppModule,
  ],
})
class ListenQueueModule {}

(async () => {
  const app = await bootstrapStandaloneApp(ListenQueueModule);

  const executionQueue = await app.resolve(SQSListener);
  await executionQueue.listenQueues();
})();
