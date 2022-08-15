import { INestApplication } from "@nestjs/common";
import { ContextIdFactory, NestFactory } from "@nestjs/core";
import { Logger as PinoLogger } from "nestjs-pino";

import { AppModule } from "@app/app.module";
import { helmetMiddleware } from "@app/common/middleware/helmet-middleware";
import { HEALTH_ROUTE } from "@app/constants";
import { DurableContextIdStrategy } from "@app/lib/nest/durable-context.strategy";

export const configureNest = (app: INestApplication): INestApplication => {
  ContextIdFactory.apply(new DurableContextIdStrategy());
  app.useLogger(app.get(PinoLogger));
  app.use(helmetMiddleware());
  app.setGlobalPrefix("api", {
    exclude: [HEALTH_ROUTE],
  });

  return app;
};

export const bootstrap = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: true,
  });

  return configureNest(app);
};
