import { Module } from "@nestjs/common";

import { CommonModule } from "@app/common/common.module";
import { DomainsModule } from "@app/common/domains.module";
import { LoggingModuleConfig } from "@app/common/logging/logging";
import { QueueModule } from "@app/queue/queue.module";

@Module({
  imports: [LoggingModuleConfig, CommonModule, QueueModule, DomainsModule],
})
export class StandaloneModule {}
