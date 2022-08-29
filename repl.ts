import { repl } from "@nestjs/core";

import { StandaloneModule } from "@app/standalone.module";

async function bootstrap() {
  await repl(StandaloneModule);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
