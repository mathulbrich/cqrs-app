import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

import { Logger } from "@app/common/logging/logger";
import { AppConfigService } from "@app/config/app-config-service";
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

  async enqueue({ groupId, messageId, payload, queue }: EnqueueArguments): Promise<void> {
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
        QueueUrl: this.utils.buildUrl(queue),
      }),
    );
  }
}
