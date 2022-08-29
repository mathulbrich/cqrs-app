import { join } from "path";

import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";

import { CommonModule } from "@app/common/common.module";
import { DomainsModule } from "@app/common/domains.module";
import { LoggingModuleConfig } from "@app/common/logging/logging";
import { SWAGGER_DOCS_ROUTE } from "@app/constants";
import { HttpAppController } from "@app/http-app.controller";
import { QueueModule } from "@app/queue/queue.module";

@Module({
  imports: [
    LoggingModuleConfig,
    CommonModule,
    QueueModule,
    DomainsModule,
    ServeStaticModule.forRoot({
      serveRoot: SWAGGER_DOCS_ROUTE,
      rootPath: join(__dirname, "../../docs"),
    }),
  ],
  controllers: [HttpAppController],
})
export class HttpAppModule {}
