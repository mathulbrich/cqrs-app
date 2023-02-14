import {
  SendMessageBatchCommand,
  SendMessageBatchRequestEntry,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { chain, defaultTo, isUndefined, omitBy } from "lodash";

import { AppConfigService } from "@app/common/config/app-config-service";
import { Logger } from "@app/common/logging/logger";
import { Injectable } from "@app/lib/nest/injectable";
import { XOR } from "@app/lib/xor";
import { EnqueueArguments, EnqueueBatchArguments, Enqueuer } from "@app/queue/application/enqueuer";
import { QueueName } from "@app/queue/application/queue-names";
import { SQSQueueUtil } from "@app/queue/application/sqs-queue-util";

const SQS_MAX_BATCH_SIZE = 10;

@Injectable()
export class SQSEnqueuer implements Enqueuer {
  private readonly logger = new Logger(SQSEnqueuer.name);
  private readonly client: SQSClient;
  constructor(private readonly utils: SQSQueueUtil, config: AppConfigService) {
    this.client = new SQSClient({
      endpoint: config.queue.sqsQueueEndpoint,
    });
  }

  async enqueue(args: XOR<EnqueueArguments, EnqueueBatchArguments>): Promise<void> {
    const messages = args.messages ?? [args];
    const messagesLog = messages.map((message) => ({
      groupId: message.groupId,
      messageId: message.messageId,
      payload: message.payload,
    }));
    if (messages.length === 1) {
      this.logger.log(`Sending message to ${args.queue}`, messagesLog[0]);
    } else {
      this.logger.log(`Sending ${messages.length} messages to ${args.queue}`, messagesLog);
    }

    await this.enqueueBatch(args.queue, messages);
  }

  private async enqueueBatch(
    queue: QueueName,
    messages: Omit<EnqueueArguments, "queue">[],
  ): Promise<void> {
    const commands = chain(messages)
      .chunk(SQS_MAX_BATCH_SIZE)
      .map(
        (batch) =>
          new SendMessageBatchCommand({
            Entries: batch.map(this.buildBatchRequestEntry.bind(this)),
            QueueUrl: this.utils.buildInternalUrl(queue),
          }),
      )
      .value();

    const results = await Promise.all(commands.map(async (command) => this.client.send(command)));
    results.forEach((result) => {
      const errorsCount = defaultTo(result.Failed, []).length;
      if (errorsCount > 0) {
        this.logger.error(`There are ${errorsCount} SQS batch errors`, {
          failed: result.Failed,
        });
        throw new Error(`Error sending ${errorsCount} batch message(s) to SQS`);
      }
    });
  }

  private buildBatchRequestEntry({
    payload,
    delaySeconds,
    groupId,
    messageId,
  }: Omit<EnqueueArguments, "queue">): SendMessageBatchRequestEntry {
    const queuePayload = typeof payload === "object" ? this.formatObjectPayload(payload) : payload;
    return {
      DelaySeconds: delaySeconds && delaySeconds < 0 ? undefined : delaySeconds,
      Id: messageId,
      MessageBody: queuePayload,
      MessageDeduplicationId: messageId,
      MessageGroupId: groupId,
    };
  }

  private formatObjectPayload(payload: object): string {
    return JSON.stringify(omitBy(payload, isUndefined));
  }
}
