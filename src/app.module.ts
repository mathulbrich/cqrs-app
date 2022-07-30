import { Module } from '@nestjs/common';
import { QueueModule } from '@app/queue/queue.module';
import { AppController } from '@app/app.controller';
import { ExampleModule } from '@app/example/example.module';
import { CommonModule } from '@app/common/common.module';

@Module({
  imports: [QueueModule, ExampleModule, CommonModule],
  controllers: [AppController],
})
export class AppModule {}
