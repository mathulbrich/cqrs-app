import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { raw } from 'body-parser';
import helmet from 'helmet';
import { AppModule } from '@app/app.module';
import { checkEnvs } from '@app/config/config.envs';

const bootstrap = async () => {
  checkEnvs();
  const app = await NestFactory.create(AppModule);
  app.use(raw({ type: 'application/octet-stream' }));
  app.use(helmet());
  await app.listen(3000);
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
