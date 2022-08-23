import {
  CreateQueueCommand,
  CreateQueueCommandOutput,
  DeleteQueueCommand,
  SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import { isError, keys } from "lodash";

import { OptionalEnv } from "@app/config/config-envs";
import { QueueMapping } from "@app/queue/application/queue-mapper";
import { QueueNames } from "@app/queue/application/queue-names";

interface Message {
  queue: QueueNames;
  content: string;
  groupId?: string;
  messageId: string;
}

export class SQSTestQueues {
  private readonly sqsBaseUrl?: string;
  private readonly queueUrls: string[] = [];
  private readonly client: SQSClient;

  constructor(private readonly suffix: string) {
    this.sqsBaseUrl = process.env[OptionalEnv.SQS_QUEUE_ENDPOINT];
    this.client = new SQSClient({
      endpoint: process.env[OptionalEnv.SQS_QUEUE_ENDPOINT],
    });
  }

  async sendMessage({ content, messageId, queue, groupId }: Message): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        MessageBody: content,
        MessageGroupId: groupId ?? messageId,
        MessageDeduplicationId: messageId,
        QueueUrl: `${this.sqsBaseUrl}${queue}${this.suffix}`,
      }),
    );
  }

  async setUp(): Promise<void> {
    const results = await Promise.all(
      keys(QueueMapping).map((queue) =>
        this.client.send(
          new CreateQueueCommand({
            Attributes: {
              FifoQueue: "true",
            },
            QueueName: `${queue}${this.suffix}`,
          }),
        ),
      ),
    );

    const queues = results.filter(
      (result) => !isError(result),
    ) as unknown as CreateQueueCommandOutput[];

    queues.forEach(({ QueueUrl }) => {
      if (QueueUrl !== undefined) {
        this.queueUrls.push(QueueUrl);
      }
    });
  }

  async tearDown(): Promise<void> {
    await Promise.all(
      this.queueUrls.map((url) =>
        this.client.send(
          new DeleteQueueCommand({
            QueueUrl: url,
          }),
        ),
      ),
    );
  }
}
