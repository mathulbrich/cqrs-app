import { join } from "path";

import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";

import { AppController } from "@app/app.controller";
import { CommonModule } from "@app/common/common.module";
import { LoggingModuleConfig } from "@app/common/logging/logging";
import { SWAGGER_DOCS_ROUTE } from "@app/constants";
import { ExampleModule } from "@app/example/example.module";
import { QueueModule } from "@app/queue/queue.module";

@Module({
  imports: [
    LoggingModuleConfig,
    CommonModule,
    QueueModule,
    ExampleModule,
    ServeStaticModule.forRoot({
      serveRoot: SWAGGER_DOCS_ROUTE,
      rootPath: join(__dirname, "../../docs"),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
