import { OnModuleInit, Scope, OnModuleDestroy, Inject } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { keys } from "lodash";
import { Params, PARAMS_PROVIDER_TOKEN } from "nestjs-pino";
import { Consumer } from "sqs-consumer";

import { Logger } from "@app/common/logging/logger";
import { wrapInContext, WrapParams } from "@app/common/logging/wrap-in-context";
import { AppConfigService } from "@app/config/app-config-service";
import { Injectable } from "@app/lib/nest/injectable";
import { QueueMapping } from "@app/queue/application/queue-mapper";
import { QueueNames } from "@app/queue/application/queue-names";
import { SQSQueueUrlBuilder } from "@app/queue/application/sqs-queue-url-builder";

@Injectable({ scope: Scope.DEFAULT })
export class SQSQueueListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SQSQueueListener.name);
  private readonly consumers = new Map<QueueNames, Consumer>();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly urlBuilder: SQSQueueUrlBuilder,
    private readonly config: AppConfigService,
    @Inject(PARAMS_PROVIDER_TOKEN)
    private readonly params: Params,
  ) {}

  onModuleInit(): void {
    const wrapParams: WrapParams = {
      loggerConfig: this.params,
      executionContext: "SQS-QUEUE",
    };
    for (const queue of keys(QueueMapping) as QueueNames[]) {
      this.logger.debug(`Listening queue ${queue}...`, SQSQueueListener.name);

      const queueUrl = this.urlBuilder.build(queue);
      const consumer = Consumer.create({
        queueUrl,
        waitTimeSeconds: this.config.queue.sqsQueueWaitTimeSeconds,
        batchSize: this.config.queue.sqsQueueBatchConsumeSize,
        handleMessageBatch: async (messages) => {
          await Promise.all(
            messages.map(async ({ Body }) =>
              wrapInContext(wrapParams, async () => {
                const message = JSON.parse(Body ?? "{}");
                this.logger.info(`Processing queue ${queue} message`, { message });
                const queueHandler = await this.moduleRef.resolve(QueueMapping[queue], undefined, {
                  strict: false,
                });
                return queueHandler.execute(message).catch((error) => {
                  this.logger.error(`Error processing queue ${queue} message`, { error });
                  throw error;
                });
              }),
            ),
          );
        },
      });

      this.consumers.set(queue, consumer);

      consumer.on("error", (err) => {
        this.logger.error(`Error while consuming queue ${queueUrl}`, err);
      });

      consumer.on("processing_error", (err) => {
        this.logger.error(`Error while processing queue ${queueUrl}`, err);
      });

      consumer.start();
    }
  }

  onModuleDestroy(): void {
    for (const consumer of this.consumers.values()) {
      consumer.stop();
    }
  }
}
