import { INestApplication } from "@nestjs/common";
import { ContextIdFactory, NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { Logger as PinoLogger } from "nestjs-pino";

import { AppModule } from "@app/app.module";
import { DurableContextIdStrategy } from "@app/lib/nest/durable-context.strategy";

export const bootstrap = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: true,
  });
  ContextIdFactory.apply(new DurableContextIdStrategy());
  app.useLogger(app.get(PinoLogger));
  app.use(helmet());
  app.setGlobalPrefix("api", {
    exclude: ["/health"],
  });

  return app;
};
