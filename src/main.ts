import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { raw } from 'body-parser';
import * as express from 'express';
import { AppModule } from '@app/app.module';
import { checkEnvs } from '@app/config/config.envs';
import helmet from 'helmet';

const bootstrap = async () => {
  checkEnvs();
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(raw({ type: 'application/octet-stream' }));
  app.use('/docs', express.static('docs/'));
  app.use(helmet());
  app.setGlobalPrefix('api', {
    exclude: ['/health'],
  });
  await app.listen(3000);
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
