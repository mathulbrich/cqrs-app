/* istanbul ignore file */
import 'module-alias/register';
import { config } from '@app/config/config-load';
import { NestFactory } from '@nestjs/core';
import { raw } from 'body-parser';
import * as express from 'express';
import { AppModule } from '@app/app.module';
import helmet from 'helmet';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.use(raw({ type: 'application/octet-stream' }));
  app.use('/docs', express.static('docs/'));
  app.use(helmet());
  app.setGlobalPrefix('api', {
    exclude: ['/health'],
  });
  await app.listen(config.app.port);
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
