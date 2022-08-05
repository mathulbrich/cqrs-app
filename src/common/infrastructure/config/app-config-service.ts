import { Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ConfigEnvs } from "@app/config/config-envs";
import { BaseClass } from "@app/lib/baseclass";
import { Injectable } from "@app/lib/nest/injectable";

@Injectable({ scope: Scope.DEFAULT })
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
