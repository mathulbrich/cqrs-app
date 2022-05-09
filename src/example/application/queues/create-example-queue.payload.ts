import { z } from 'zod';

export const CreateExampleQueuePayload = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().nonempty(),
});

export type CreateExampleQueuePayload = z.infer<
  typeof CreateExampleQueuePayload
>;
