import { Scope } from "@nestjs/common";

import { AppConfigService } from "@app/config/app-config-service";
import { Injectable } from "@app/lib/nest/injectable";

@Injectable({ scope: Scope.DEFAULT })
export class SQSQueueUrlBuilder {
  constructor(private readonly config: AppConfigService) {}

  public build(queue: string): string {
    const { sqsQueueBaseUrl, sqsQueueSuffix } = this.config.queue;
    return `${sqsQueueBaseUrl}${queue}${sqsQueueSuffix}`;
  }
}
