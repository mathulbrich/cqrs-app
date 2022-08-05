import assert from "assert";

import {
  Body,
  Controller,
  HttpCode,
  Post,
  Logger,
  BadRequestException,
  Param,
} from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

import {
  QueueMapping,
  isValidQueue,
} from "@app/queue/application/queue-mapper";

@Controller("v1/queue-handler")
export class GcloudTasksQueueController {
  public constructor(private readonly moduleRef: ModuleRef) {}

  @Post(":queue")
  @HttpCode(200)
  public async handle(
    @Param("queue") queueName: string,
    @Body() payload: Buffer,
  ): Promise<void> {
    Logger.log(`Processing queue ${queueName}`);
    assert(isValidQueue(queueName), new BadRequestException());

    return (
      await this.moduleRef.resolve(QueueMapping[queueName], undefined, {
        strict: false,
      })
    ).execute(JSON.parse(payload.toString()));
  }
}
