import { Scope } from "@nestjs/common";
// eslint-disable-next-line no-restricted-imports
import { ConfigService } from "@nestjs/config";

import { ConfigEnvs } from "@app/common/config/config-envs";
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
