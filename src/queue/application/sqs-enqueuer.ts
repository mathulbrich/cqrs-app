import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { isUndefined, omitBy } from "lodash";

import { AppConfigService } from "@app/common/config/app-config-service";
import { Logger } from "@app/common/logging/logger";
import { Injectable } from "@app/lib/nest/injectable";
import { EnqueueArguments, Enqueuer } from "@app/queue/application/enqueuer";
import { SQSQueueUtil } from "@app/queue/application/sqs-queue-util";

@Injectable()
export class SQSEnqueuer implements Enqueuer {
  private readonly logger = new Logger(SQSEnqueuer.name);
  private readonly client: SQSClient;

  constructor(private readonly utils: SQSQueueUtil, config: AppConfigService) {
    this.client = new SQSClient({
      endpoint: config.queue.sqsQueueEndpoint,
    });
  }

  async enqueue({
    groupId,
    messageId,
    payload,
    queue,
    delaySeconds,
  }: EnqueueArguments): Promise<void> {
    const queuePayload = typeof payload === "object" ? this.formatObjectPayload(payload) : payload;
    this.logger.log(`Sending message to ${queue}`, {
      groupId,
      messageId,
      payload: queuePayload,
      queue,
    });

    await this.client.send(
      new SendMessageCommand({
        DelaySeconds: delaySeconds && delaySeconds < 0 ? undefined : delaySeconds,
        MessageBody: queuePayload,
        MessageDeduplicationId: messageId,
        MessageGroupId: groupId,
        // TODO change to build for external queues too when we have them
        QueueUrl: this.utils.buildInternalUrl(queue),
      }),
    );
  }
  private formatObjectPayload(payload: object): string {
    return JSON.stringify(omitBy(payload, isUndefined));
  }
}
