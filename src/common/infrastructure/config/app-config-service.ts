import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ConfigEnvs } from "@app/config/config-envs";
import { BaseClass } from "@app/lib/baseclass";

@Injectable()
export class AppConfigService extends BaseClass<ConfigEnvs>() {
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
