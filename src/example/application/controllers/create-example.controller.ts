import { Body, Controller, Post, Response } from '@nestjs/common';
import { Enqueuer } from '@app/queue/enqueuer';
import { v4 as uuidV4 } from 'uuid';
import { Response as Res } from 'express';
import { CreateExamplePayload } from '@app/example/application/controllers/create-example.payload';

@Controller('api/v1/create-example')
export class CreateExampleController {
  public constructor(private readonly enqueuer: Enqueuer) {}

  @Post()
  public async accept(
    @Body() example: unknown,
    @Response() res: Res,
  ): Promise<void> {
    const { description, name } = CreateExamplePayload.parse(example);
    const id = uuidV4();

    await this.enqueuer.enqueue({
      queue: 'create-example',
      payload: JSON.stringify({ id, description, name }),
      syncId: id,
    });

    res.set('example-id', id).json({});
  }
}
