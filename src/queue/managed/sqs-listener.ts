/* eslint-disable no-await-in-loop */
import {
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { Inject } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { forOwn } from "lodash";
import { PARAMS_PROVIDER_TOKEN, Params } from "nestjs-pino";

import { AppConfigService } from "@app/common/config/app-config-service";
import { Logger } from "@app/common/logging/logger";
import { wrapInContext, WrapParams } from "@app/common/logging/wrap-in-context";
import { SQS_QUEUE_CONTEXT } from "@app/constants";
import { Injectable } from "@app/lib/nest/injectable";
import { QueueMapping } from "@app/queue/application/queue-mapper";
import { InternalQueue } from "@app/queue/application/queue-names";
import { SQSQueueUtil } from "@app/queue/application/sqs-queue-util";

@Injectable()
export class SQSListener {
  private readonly logger = new Logger(SQSListener.name);
  private stopped = false;

  constructor(
    private readonly config: AppConfigService,
    private readonly moduleRef: ModuleRef,
    private readonly utils: SQSQueueUtil,
    @Inject(PARAMS_PROVIDER_TOKEN)
    private readonly params: Params,
  ) {}

  stop(): void {
    this.stopped = true;
  }

  async listenQueues(): Promise<void> {
    const executeQueues: Promise<void>[] = [];

    forOwn(QueueMapping, (_, queueName) => {
      this.logger.info("Starting SQS Listener", { queueName });
      executeQueues.push(this.listen(queueName as InternalQueue));
    });

    await Promise.all(executeQueues);
  }

  private async listen(queueName: InternalQueue): Promise<void> {
    if (this.stopped) {
      this.logger.debug("Stopping listening queue", { queueName });
      return;
    }

    const client = new SQSClient({
      endpoint: this.config.queue.sqsQueueEndpoint,
    });
    const queueUrl = this.utils.buildUrl(queueName);
    const messages = await this.receiveMessages(client, queueUrl);

    // the processing is doing sequentially to avoid cross message event issues
    for (const sqsMessage of messages) {
      await wrapInContext(this.wrapParams(), async () => {
        const message = JSON.parse(sqsMessage.Body ?? "{}");
        this.logger.info("Processing SQS Message", { message, queueName });
        const queueListener = await this.moduleRef.resolve(
          QueueMapping[queueName].listener,
          undefined,
          {
            strict: false,
          },
        );

        await queueListener
          .execute(message)
          .then(async () => this.deleteMessage(client, queueUrl, sqsMessage))
          .catch((error) => {
            this.logger.error(`Error processing queue ${queueName} message`, error.stack);
          });
      });
    }

    setTimeout(this.listen.bind(this, queueName), this.config.queue.sqsPollingIntervalMillis);
  }

  private async receiveMessages(client: SQSClient, queueUrl: string): Promise<Message[]> {
    const command = new ReceiveMessageCommand({
      MaxNumberOfMessages: this.config.queue.sqsQueueBatchConsumeSize,
      QueueUrl: queueUrl,
      WaitTimeSeconds: this.config.queue.sqsQueueWaitTimeSeconds,
    });

    return client
      .send(command)
      .then((result) => result.Messages ?? [])
      .catch((error) => {
        this.logger.error("Error receiving messages", error.stack);
        return [];
      });
  }

  private async deleteMessage(
    client: SQSClient,
    queueUrl: string,
    message: Message,
  ): Promise<void> {
    await client.send(
      new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle,
      }),
    );
  }

  private wrapParams(): WrapParams {
    return {
      loggerConfig: this.params,
      executionContext: SQS_QUEUE_CONTEXT,
    };
  }
}
