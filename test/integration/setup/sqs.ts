import envs from "@test/load-envs";

import {
  CreateQueueCommand,
  CreateQueueCommandOutput,
  DeleteQueueCommand,
  SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import { INestApplication } from "@nestjs/common";
import { isError, keys } from "lodash";

import { QueueMapping } from "@app/queue/application/queue-mapper";
import { QueueNames } from "@app/queue/application/queue-names";
import { SQSListener } from "@app/queue/managed/sqs-listener";

export type ManagedSQS = Omit<SQSTestQueues, "setUp" | "tearDown">;

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
  private queue?: SQSListener;

  constructor(private readonly suffix: string) {
    this.sqsBaseUrl = envs.queue.sqsQueueEndpoint;
    this.client = new SQSClient({
      endpoint: this.sqsBaseUrl,
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

  async setUp(app: INestApplication): Promise<void> {
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

    const queue = await app.resolve(SQSListener);
    await queue.listenQueues();
    this.queue = queue;
  }

  async tearDown(): Promise<void> {
    this.queue?.stop();

    const client = new SQSClient({
      endpoint: envs.queue.sqsQueueEndpoint,
    });

    await Promise.all(
      this.queueUrls.map((url) =>
        client.send(
          new DeleteQueueCommand({
            QueueUrl: url,
          }),
        ),
      ),
    );
  }
}
