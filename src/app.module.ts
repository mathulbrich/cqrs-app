import { Module } from '@nestjs/common';
import { QueueModule } from '@app/queue/queue.module';
import { AppController } from '@app/app.controller';
import { ExampleModule } from '@app/example/example.module';

@Module({
  imports: [QueueModule, ExampleModule],
  controllers: [AppController],
})
export class AppModule {}
