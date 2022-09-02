import { z } from "zod";

import { Newable } from "@app/lib/newable";
import { SQSMessageEvent } from "@app/queue/lambda/sqs-event";
import { SQSLambda } from "@app/queue/lambda/sqs-lambda";

const EventSource = ["aws:sqs"] as const;
type EventSource = typeof EventSource[number];

interface EventResolver {
  parser: z.AnyZodObject;
  eventHandler: Newable<{ handle(data: unknown): Promise<void> }>;
}

export const LambdaTriggerEvent = z
  .object({
    Records: z
      .array(
        z.object({
          eventSource: z.enum(EventSource),
        }),
      )
      .length(1, "Exactly one record is required"),
  })
  .transform((data) => data.Records[0].eventSource);

export type LambdaTriggerEvent = z.infer<typeof LambdaTriggerEvent>;

export const LambdaEventFactory: Record<EventSource, EventResolver> = {
  "aws:sqs": {
    parser: SQSMessageEvent,
    eventHandler: SQSLambda,
  },
};
