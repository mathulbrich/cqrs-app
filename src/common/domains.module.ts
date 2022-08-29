import { Global, Module } from "@nestjs/common";

import { ExampleModule } from "@app/example/example.module";

@Global()
@Module({
  imports: [ExampleModule],
})
export class DomainsModule {}
