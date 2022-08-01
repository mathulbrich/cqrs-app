/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Baseclass } from '@app/lib/baseclass';
import { ConfigEnvs } from '@app/config/config-envs';

@Injectable()
export class AppConfigService extends Baseclass<Partial<ConfigEnvs>>() {
  constructor(configService: ConfigService) {
    super({
      app: {
        useInMemoryRepository: configService.get('app.useInMemoryRepository')!,
        port: configService.get('app.port')!,
      },
    });
  }
}
