import {
  CreateQueueCommand,
  CreateQueueCommandOutput,
  DeleteQueueCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { isError, keys } from "lodash";

import { OptionalEnv } from "@app/config/config-envs";
import { QueueMapping } from "@app/queue/application/queue-mapper";

export class SQSTestQueues {
  private readonly queueUrls: string[] = [];

  constructor(private readonly suffix: string) {}

  async setUp(): Promise<void> {
    const client = new SQSClient({
      endpoint: process.env[OptionalEnv.SQS_QUEUE_ENDPOINT],
    });

    const results = await Promise.all(
      keys(QueueMapping).map((queue) =>
        client.send(
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
    const client = new SQSClient({
      endpoint: process.env[OptionalEnv.SQS_QUEUE_ENDPOINT],
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
