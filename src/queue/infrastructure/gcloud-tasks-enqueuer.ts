import { CloudTasksClient } from '@google-cloud/tasks';
import { credentials } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { Enqueuer, EnqueueArguments } from '@app/queue/infrastructure/enqueuer';
import { QueueConfigService } from '@app/common/infrastructure/config/queue-config-service';

@Injectable()
export class GcloudTasksEnqueuer implements Enqueuer {
  private readonly client: CloudTasksClient;

  public constructor(private readonly service: QueueConfigService) {
    this.client = new CloudTasksClient({
      port: service.queuePort,
      servicePath: service.queueHost,
      sslCreds: credentials.createInsecure(),
    });
  }

  public async enqueue({
    queue,
    syncId,
    payload,
  }: EnqueueArguments): Promise<void> {
    Logger.log(`Enqueuing task to queue ${queue}`);
    const { queueProject, queueRegion, queueHandlerUrl } = this.service;
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
