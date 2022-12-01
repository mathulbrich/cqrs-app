import { z } from "zod";

export const CreateExampleQueuePayload = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
});

export type CreateExampleQueuePayload = z.infer<typeof CreateExampleQueuePayload>;
