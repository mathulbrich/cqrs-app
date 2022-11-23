import envs from "@test/load-envs";

import {
  CreateQueueCommand,
  CreateQueueCommandOutput,
  DeleteQueueCommand,
  SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import { INestApplication } from "@nestjs/common";
import { isError } from "lodash";

import { QueueMapping, queueTypeSuffixFactory } from "@app/queue/application/queue-mapper";
import { QueueName, InternalQueues } from "@app/queue/application/queue-names";
import { SQSListener } from "@app/queue/managed/sqs-listener";
import { TestService } from "@test/integration/setup/service";

export type ManagedSQS = Omit<SQSTestQueues, "setUp" | "tearDown">;

interface Message {
  queue: QueueName;
  content: string;
  groupId?: string;
  messageId: string;
}

export class SQSTestQueues implements TestService {
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
    const typeSuffix = this.buildQueueTypeSuffix(queue);
    await this.client.send(
      new SendMessageCommand({
        MessageBody: content,
        MessageGroupId: groupId ?? messageId,
        MessageDeduplicationId: messageId,
        QueueUrl: `${this.sqsBaseUrl}${queue}${this.suffix}${typeSuffix}`,
      }),
    );
  }

  async setUp(app: INestApplication): Promise<void> {
    const results = await Promise.all(
      InternalQueues.map(async (queue) =>
        this.client.send(
          new CreateQueueCommand({
            Attributes: {
              FifoQueue: (QueueMapping[queue].type === "fifo").toString(),
            },
            QueueName: `${queue}${this.suffix}${queueTypeSuffixFactory[QueueMapping[queue].type]}`,
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
      this.queueUrls.map(async (url) =>
        client.send(
          new DeleteQueueCommand({
            QueueUrl: url,
          }),
        ),
      ),
    );
  }

  private buildQueueTypeSuffix(queue: QueueName): string {
    const queueType = QueueMapping[queue].type;
    return queueTypeSuffixFactory[queueType];
  }
}
