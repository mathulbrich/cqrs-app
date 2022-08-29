import { z } from "zod";

export const SQSMessageEvent = z.object({
  Records: z
    .array(
      z.object({
        body: z.string().optional(),
        eventSource: z.literal("aws:sqs"),
        eventSourceARN: z.string().min(1),
        messageId: z.string().uuid(),
        receiptHandle: z.string().min(1),
      }),
    )
    .min(1, "At least one SQS message is required")
    .max(1, "More than one SQS message is not supported"),
});

export type SQSMessageEvent = z.infer<typeof SQSMessageEvent>;
