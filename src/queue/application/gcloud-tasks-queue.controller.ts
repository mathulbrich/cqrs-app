import {
  Body,
  Controller,
  HttpCode,
  Post,
  Logger,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  QueueMapping,
  isValidQueue,
} from '@app/queue/application/queue-mapper';
import * as assert from 'assert';

@Controller('v1/queue-handler')
export class GcloudTasksQueueController {
  public constructor(private readonly moduleRef: ModuleRef) {}

  @Post(':queue')
  @HttpCode(200)
  public async handle(
    @Param('queue') queueName: string,
    @Body() payload: Buffer,
  ): Promise<void> {
    Logger.log(`Processing queue ${queueName}`);
    assert(isValidQueue(queueName), new BadRequestException());

    return this.moduleRef
      .get(QueueMapping[queueName], {
        strict: false,
      })
      .execute(JSON.parse(payload.toString()));
  }
}
