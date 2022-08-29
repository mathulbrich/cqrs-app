import { Scope } from "@nestjs/common";
import { findLastIndex } from "lodash";

import { AppConfigService } from "@app/config/app-config-service";
import { assert } from "@app/lib/assert";
import { Injectable } from "@app/lib/nest/injectable";
import { isValidQueue } from "@app/queue/application/queue-mapper";
import { QueueNames } from "@app/queue/application/queue-names";

@Injectable({ scope: Scope.DEFAULT })
export class SQSQueueUtil {
  constructor(private readonly config: AppConfigService) {}

  buildUrl(queue: string): string {
    const { sqsQueueBaseUrl, sqsQueueSuffix } = this.config.queue;
    return `${sqsQueueBaseUrl}${queue}${sqsQueueSuffix}`;
  }

  getQueueFromArn(queueARN: string): QueueNames {
    const arnItems = queueARN.split(":");
    const queueName = arnItems[findLastIndex(arnItems)].replace(
      this.config.queue.sqsQueueSuffix,
      "",
    );

    assert(isValidQueue(queueName), `Invalid queue name: ${queueName}`);
    return queueName;
  }
}
