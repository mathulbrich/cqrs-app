import { randomUUID } from "crypto";

import { OnModuleInit, Scope, OnModuleDestroy, Inject } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { keys } from "lodash";
import { Params, PARAMS_PROVIDER_TOKEN, PinoLogger } from "nestjs-pino";
import { storage, Store } from "nestjs-pino/storage";
import { Consumer } from "sqs-consumer";

import { Logger } from "@app/common/logging/logger";
import { Injectable } from "@app/lib/nest/injectable";
import { QueueMapping } from "@app/queue/application/queue-mapper";
import { QueueNames } from "@app/queue/application/queue-names";
import { SQSQueueUrlBuilder } from "@app/queue/application/sqs-queue-url-builder";

const maxNumberOfMessages = 10;

@Injectable({ scope: Scope.DEFAULT })
export class SQSQueueListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SQSQueueListener.name);
  private readonly consumers = new Map<QueueNames, Consumer>();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly urlBuilder: SQSQueueUrlBuilder,
    @Inject(PARAMS_PROVIDER_TOKEN)
    private readonly params: Params,
  ) {}

  public onModuleInit(): void {
    for (const queue of keys(QueueMapping) as QueueNames[]) {
      this.logger.debug(`Listening queue ${queue}...`, SQSQueueListener.name);

      const queueUrl = this.urlBuilder.build(queue);
      const consumer = Consumer.create({
        queueUrl,
        batchSize: maxNumberOfMessages,
        handleMessageBatch: async (messages) => {
          await Promise.all(
            messages.map(async ({ Body }) => {
              return storage.run(new Store(PinoLogger.root), async () => {
                new PinoLogger(this.params).assign({
                  reqId: { requestId: randomUUID() },
                });
                const queueHandler = await this.moduleRef.resolve(
                  QueueMapping[queue as QueueNames],
                  undefined,
                  { strict: false },
                );
                return queueHandler.execute(JSON.parse(Body ?? "{}"));
              });
            }),
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

  public onModuleDestroy(): void {
    for (const consumer of this.consumers.values()) {
      consumer.stop();
    }
  }
}
