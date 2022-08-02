import { Module } from "@nestjs/common";

import { AppController } from "@app/app.controller";
import { CommonModule } from "@app/common/common.module";
import { ExampleModule } from "@app/example/example.module";
import { QueueModule } from "@app/queue/queue.module";

@Module({
  imports: [QueueModule, ExampleModule, CommonModule],
  controllers: [AppController],
})
export class AppModule {}
