import { CloudTasksClient } from '@google-cloud/tasks';
import { credentials } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { config } from '@app/config/config.envs';
import { Enqueuer, EnqueueArguments } from '@app/queue/infrastructure/enqueuer';

@Injectable()
export class GcloudTasksEnqueuer extends Enqueuer {
  private readonly client: CloudTasksClient;

  public constructor() {
    super();
    this.client = new CloudTasksClient({
      port: config.queue.queuePort,
      servicePath: config.queue.queueHost,
      sslCreds: credentials.createInsecure(),
    });
  }

  public async enqueue({
    queue,
    syncId,
    payload,
  }: EnqueueArguments): Promise<void> {
    Logger.log(`Enqueuing task to queue ${queue}`);
    const { queueProject, queueRegion } = config.queue;
    await this.client.createTask({
      parent: this.client.queuePath(queueProject, queueRegion, queue),
      task: {
        name: this.client.taskPath(queueProject, queueRegion, queue, syncId),
        httpRequest: {
          httpMethod: 'POST',
          url: `${config.queue.queueHandlerUrl}/${queue}`,
          body: Buffer.from(payload).toString('base64'),
          headers: {
            'Content-Type': 'application/octet-stream',
          },
        },
      },
    });
  }
}
