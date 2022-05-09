import { z } from 'zod';

export const GetExampleResponse = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().nonempty(),
});

export type GetExampleResponse = z.infer<typeof GetExampleResponse>;
