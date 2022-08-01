import { CloudTasksClient } from '@google-cloud/tasks';
import { credentials } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { Enqueuer, EnqueueArguments } from '@app/queue/infrastructure/enqueuer';
import { AppConfigService } from '@app/common/infrastructure/config/app-config-service';

@Injectable()
export class GcloudTasksEnqueuer implements Enqueuer {
  private readonly client: CloudTasksClient;

  public constructor(private readonly config: AppConfigService) {
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
    const { queueProject, queueRegion, queueHandlerUrl } = this.config.queue;
    await this.client.createTask({
      parent: this.client.queuePath(queueProject, queueRegion, queue),
      task: {
        name: this.client.taskPath(queueProject, queueRegion, queue, syncId),
        httpRequest: {
          httpMethod: 'POST',
          url: `${queueHandlerUrl}/${queue}`,
          body: Buffer.from(payload).toString('base64'),
          headers: {
            'Content-Type': 'application/octet-stream',
          },
        },
      },
    });
  }
}
