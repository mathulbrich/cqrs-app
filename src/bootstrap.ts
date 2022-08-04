import { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { raw } from "body-parser";
import helmet from "helmet";
import { Logger as PinoLogger } from "nestjs-pino";

import { AppModule } from "@app/app.module";

export const bootstrap = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: true,
  });
  const logger = app.get(PinoLogger);
  app.useLogger(logger);
  app.use(raw({ type: "application/octet-stream" }));
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.setGlobalPrefix("api", {
    exclude: ["/health"],
  });

  return app;
};
