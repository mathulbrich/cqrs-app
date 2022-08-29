import { INestApplication, INestApplicationContext } from "@nestjs/common";
import { ContextIdFactory, NestFactory } from "@nestjs/core";
import { Logger as PinoLogger } from "nestjs-pino";

import { helmetMiddleware } from "@app/common/middleware/helmet-middleware";
import { HEALTH_ROUTE } from "@app/constants";
import { HttpAppModule } from "@app/http-app.module";
import { DurableContextIdStrategy } from "@app/lib/nest/durable-context.strategy";

const configureNest = <T extends INestApplicationContext>(app: T): void => {
  ContextIdFactory.apply(new DurableContextIdStrategy());
  app.useLogger(app.get(PinoLogger));
};

export const bootstrapHttpApp = async (
  createdApp?: INestApplication,
): Promise<INestApplication> => {
  const app =
    createdApp ??
    (await NestFactory.create(HttpAppModule, {
      bufferLogs: true,
      cors: true,
    }));
  configureNest(app);
  app.use(helmetMiddleware());
  app.setGlobalPrefix("api", {
    exclude: [HEALTH_ROUTE],
  });

  return app;
};

export const bootstrapStandaloneApp = async (module: unknown): Promise<INestApplicationContext> => {
  const app = await NestFactory.createApplicationContext(module, { bufferLogs: true });
  configureNest(app);
  app.flushLogs();

  return app;
};
