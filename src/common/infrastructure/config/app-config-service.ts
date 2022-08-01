import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Baseclass } from '@app/lib/baseclass';
import { ConfigEnvs } from '@app/config/config-envs';

@Injectable()
export class AppConfigService extends Baseclass<ConfigEnvs>() {
  constructor(configService: ConfigService) {
    super(
      Object.assign(
        {},
        ...Object.keys(ConfigEnvs.shape).map((value) => ({
          [value]: configService.get(value, { infer: true }),
        })),
      ) as ConfigEnvs,
    );
  }
}
