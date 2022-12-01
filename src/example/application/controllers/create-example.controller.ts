import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";

import { ValidateSchema } from "@app/common/application/schema-validation-pipe";
import { CreateExamplePayload } from "@app/example/application/controllers/create-example-payload";
import { Uuid } from "@app/lib/uuid";
import { Enqueuer } from "@app/queue/application/enqueuer";

@Controller("v1/create-example")
export class CreateExampleController {
  constructor(private readonly enqueuer: Enqueuer) {}

  @Post()
  @ValidateSchema(CreateExamplePayload)
  async accept(@Body() example: CreateExamplePayload, @Res() res: Response): Promise<void> {
    const { description, name } = example;
    const id = Uuid.generate().toString();

    await this.enqueuer.enqueue({
      queue: "create-example",
      payload: JSON.stringify({
        id,
        description,
        name,
      }),
      messageId: id,
    });

    res.set("example-id", id).send();
  }
}
