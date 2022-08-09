import { INestApplication } from "@nestjs/common";
import { ContextIdFactory, NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { Logger as PinoLogger } from "nestjs-pino";

import { AppModule } from "@app/app.module";
import { HEALTH_ROUTE, SWAGGER_DOCS_ROUTE } from "@app/constants";
import {
  useMiddlewareExceptFor,
  useMiddlewareOnlyFor,
} from "@app/lib/middleware/use-middleware";
import { DurableContextIdStrategy } from "@app/lib/nest/durable-context.strategy";

export const bootstrap = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: true,
  });
  ContextIdFactory.apply(new DurableContextIdStrategy());
  app.useLogger(app.get(PinoLogger));
  app.use(useMiddlewareExceptFor([SWAGGER_DOCS_ROUTE], helmet()));

  // Swagger CSP policy
  app.use(
    useMiddlewareOnlyFor(
      [SWAGGER_DOCS_ROUTE],
      helmet({
        contentSecurityPolicy: {
          directives: {
            imgSrc: ["'self'", "data:", "unpkg.com"],
            scriptSrc: ["'self'", "https: 'unsafe-inline'"],
          },
        },
      }),
    ),
  );

  app.setGlobalPrefix("api", {
    exclude: [HEALTH_ROUTE],
  });

  return app;
};
