import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ExampleRepository } from '@app/example/domain/repositories/example.repository';
import {
  fromDomain,
  GetExampleResponse,
} from '@app/example/application/controllers/get-example-response';
import { ValidateSchema } from '@app/common/application/schema-validation-pipe';
import { UuidSchema, Uuid } from '@app/lib/uuid';

@Controller('v1/example')
export class GetExampleController {
  public constructor(private readonly repository: ExampleRepository) {}

  @Get()
  public async all(): Promise<GetExampleResponse[]> {
    const examples = new Array<GetExampleResponse>();
    for await (const example of this.repository.findAll()) {
      examples.push(fromDomain(example));
    }

    return examples;
  }

  @Get(':id')
  @ValidateSchema(UuidSchema)
  public async get(@Param('id') id: string): Promise<GetExampleResponse> {
    return (await this.repository.findById(new Uuid(id)))
      .map(fromDomain)
      .orElseThrow(new NotFoundException());
  }
}
