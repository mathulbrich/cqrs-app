import { join } from "path";

import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";

import { AppController } from "@app/app.controller";
import { CommonModule } from "@app/common/common.module";
import { ExampleModule } from "@app/example/example.module";
import { QueueModule } from "@app/queue/queue.module";

@Module({
  imports: [
    QueueModule,
    ExampleModule,
    CommonModule,
    ServeStaticModule.forRoot({
      serveRoot: "/docs",
      rootPath: join(__dirname, "../../docs"),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
