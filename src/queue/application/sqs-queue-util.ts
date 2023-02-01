import { Scope } from "@nestjs/common";
import { findLastIndex } from "lodash";

import { AppConfigService } from "@app/common/config/app-config-service";
import { assertReturningLiteralOf } from "@app/lib/assert";
import { Injectable } from "@app/lib/nest/injectable";
import { QueueMapping, queueTypeSuffixFactory } from "@app/queue/application/queue-mapper";
import { InternalQueue, InternalQueues } from "@app/queue/application/queue-names";

@Injectable({ scope: Scope.DEFAULT })
export class SQSQueueUtil {
  constructor(private readonly config: AppConfigService) {}

  buildInternalUrl(queue: InternalQueue): string {
    const { sqsQueueBaseUrl, sqsQueueSuffix } = this.config.queue;
    const queueType = QueueMapping[queue].type;
    return `${sqsQueueBaseUrl}${queue}${sqsQueueSuffix}${queueTypeSuffixFactory[queueType]}`;
  }

  getQueueFromArn(queueARN: string): InternalQueue {
    const arnItems = queueARN.split(":");
    const queueName = arnItems[findLastIndex(arnItems)]
      .replace(this.config.queue.sqsQueueSuffix, "")
      .replace(".fifo", "");

    return assertReturningLiteralOf(InternalQueues, queueName, `Invalid queue name: ${queueName}`);
  }
}
