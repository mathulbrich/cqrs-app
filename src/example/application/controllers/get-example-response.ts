import { z } from 'zod';
import { Example } from '@app/example/domain/example';

export const GetExampleResponse = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
});

export type GetExampleResponse = z.infer<typeof GetExampleResponse>;

export const fromDomain = (example: Example): GetExampleResponse =>
  GetExampleResponse.parse({
    id: example.id.toString(),
    name: example.name,
    description: example.description,
  });
