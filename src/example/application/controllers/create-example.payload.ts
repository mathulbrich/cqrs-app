import { z } from "zod";

export const CreateExamplePayload = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export type CreateExamplePayload = z.infer<typeof CreateExamplePayload>;
