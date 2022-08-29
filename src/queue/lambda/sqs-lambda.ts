import { ModuleRef } from "@nestjs/core";

import { Logger } from "@app/common/logging/logger";
import { Injectable } from "@app/lib/nest/injectable";
import { QueueMapping } from "@app/queue/application/queue-mapper";
import { SQSQueueUtil } from "@app/queue/application/sqs-queue-util";
import { SQSMessageEvent } from "@app/queue/lambda/sqs-event";

@Injectable()
export class SQSLambda {
  private readonly logger = new Logger(SQSLambda.name);

  constructor(private readonly moduleRef: ModuleRef, private readonly utils: SQSQueueUtil) {}

  async handle(messages: SQSMessageEvent): Promise<void> {
    const [sqsMessage] = messages.Records;
    const queueName = this.utils.getQueueFromArn(sqsMessage.eventSourceARN);
    const message = JSON.parse(sqsMessage.body ?? "{}");
    this.logger.info("Processing SQS Message", { message, queueName });
    const queueHandler = await this.moduleRef.resolve(QueueMapping[queueName], undefined, {
      strict: false,
    });

    await queueHandler.execute(message).catch((error) => {
      this.logger.error(`Error processing queue ${queueName} message`, error.stack);
      throw error;
    });
  }
}
