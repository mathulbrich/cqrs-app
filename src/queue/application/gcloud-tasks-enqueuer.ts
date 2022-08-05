import { CloudTasksClient } from "@google-cloud/tasks";
import { credentials } from "@grpc/grpc-js";
import { Logger } from "@nestjs/common";

import { AppConfigService } from "@app/config/app-config-service";
import { Injectable } from "@app/lib/nest/injectable";
import { Enqueuer, EnqueueArguments } from "@app/queue/application/enqueuer";

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
    const {
      queueProject,
      queueRegion,
      queueHandlerProtocol,
      queueHandlerHost,
      queueHandlerPort,
      queueHandlerEndpoint,
    } = this.config.queue;

    await this.client.createTask({
      parent: this.client.queuePath(queueProject, queueRegion, queue),
      task: {
        name: this.client.taskPath(queueProject, queueRegion, queue, syncId),
        httpRequest: {
          httpMethod: "POST",
          url: `${queueHandlerProtocol}://${queueHandlerHost}:${queueHandlerPort}/${queueHandlerEndpoint}/${queue}`,
          body: Buffer.from(payload).toString("base64"),
          headers: {
            "Content-Type": "application/octet-stream",
          },
        },
      },
    });
  }
}
