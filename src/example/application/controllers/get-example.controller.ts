import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ExampleRepository } from '@app/example/domain/repositories/example.repository';
import { Example } from '@app/example/domain/example';
import { GetExampleResponse } from '@app/example/application/controllers/get-example-response';

@Controller('api/v1/example')
export class GetExampleController {
  public constructor(private readonly repository: ExampleRepository) {}

  @Get(':id')
  public async get(@Param('id') id: string): Promise<Example> {
    return (await this.repository.findById(id))
      .map(GetExampleResponse.parse)
      .orElseThrow(new NotFoundException());
  }
}
