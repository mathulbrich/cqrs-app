import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

import { Logger } from "@app/common/logging/logger";
import { AppConfigService } from "@app/config/app-config-service";
import { Injectable } from "@app/lib/nest/injectable";
import { EnqueueArguments, Enqueuer } from "@app/queue/application/enqueuer";
import { SQSQueueUrlBuilder } from "@app/queue/application/sqs-queue-url-builder";

@Injectable()
export class SQSEnqueuer implements Enqueuer {
  private readonly logger = new Logger(SQSEnqueuer.name);
  private readonly client: SQSClient;

  constructor(
    private readonly sqsUrlBuilder: SQSQueueUrlBuilder,
    config: AppConfigService,
  ) {
    this.client = new SQSClient({
      endpoint: config.queue.sqsQueueEndpoint,
    });
  }

  public async enqueue({
    groupId,
    messageId,
    payload,
    queue,
  }: EnqueueArguments): Promise<void> {
    this.logger.log(`Sending message to ${queue}`, {
      groupId,
      messageId,
      payload,
      queue,
    });

    await this.client.send(
      new SendMessageCommand({
        MessageBody: payload,
        MessageDeduplicationId: messageId,
        MessageGroupId: groupId ?? messageId,
        QueueUrl: this.sqsUrlBuilder.build(queue),
      }),
    );
  }
}
