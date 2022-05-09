import { z } from 'zod';

export const CreateExamplePayload = z.object({
  name: z.string().nonempty(),
  description: z.string().nonempty(),
});

export type CreateExamplePayload = z.infer<typeof CreateExamplePayload>;
