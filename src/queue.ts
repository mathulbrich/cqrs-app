/* eslint-disable @typescript-eslint/no-floating-promises */
import "source-map-support/register";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestFactory, ContextIdFactory } from "@nestjs/core";
import { Logger as PinoLogger } from "nestjs-pino";

import { AppModule } from "@app/app.module";
import { validateConfig, Env } from "@app/config/config-envs";
import { DurableContextIdStrategy } from "@app/lib/nest/durable-context.strategy";
import { SQSListener } from "@app/queue/application/sqs-listener";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (config) =>
        validateConfig({
          ...config,
          [Env.APP_NAME]: "SQS-QUEUE",
        }),
    }),
    AppModule,
  ],
})
class ListenQueueModule {}

(async () => {
  const app = await NestFactory.createApplicationContext(ListenQueueModule, { bufferLogs: true });
  ContextIdFactory.apply(new DurableContextIdStrategy());
  app.useLogger(app.get(PinoLogger));
  app.flushLogs();

  const executionQueue = await app.resolve(SQSListener);
  await executionQueue.listenQueues();
})();
