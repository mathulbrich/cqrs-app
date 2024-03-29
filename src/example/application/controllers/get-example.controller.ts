import { Controller, Get, Param, NotFoundException } from "@nestjs/common";

import { withValidation } from "@app/common/application/schema-validation-pipe";
import {
  fromDomain,
  GetExampleResponse,
} from "@app/example/application/controllers/get-example-response";
import { ExampleRepository } from "@app/example/domain/repositories/example-repository";
import { UuidSchema, Uuid } from "@app/lib/uuid";

@Controller("v1/example")
export class GetExampleController {
  constructor(private readonly repository: ExampleRepository) {}

  @Get()
  async all(): Promise<GetExampleResponse[]> {
    const examples = new Array<GetExampleResponse>();
    for await (const example of this.repository.findAll()) {
      examples.push(fromDomain(example));
    }

    return examples;
  }

  @Get(":id")
  async get(@Param("id", withValidation(UuidSchema)) id: string): Promise<GetExampleResponse> {
    return (await this.repository.findById(new Uuid(id)))
      .map(fromDomain)
      .orElseThrow(new NotFoundException());
  }
}
