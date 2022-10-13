import envs, { reassignEnvs } from "@test/load-envs";

import { faker } from "@faker-js/faker";
// eslint-disable-next-line no-restricted-imports
import { ConfigService } from "@nestjs/config";

import { AppConfigService } from "@app/common/config/app-config-service";

describe(AppConfigService.name, () => {
  it("should assign variables properly", () => {
    const fakeEnv = faker.lorem.word();
    const config = new AppConfigService(
      new ConfigService({
        app: {
          env: fakeEnv,
        },
      }),
    );
    expect(config.app.env).toBe(fakeEnv);
    expect(config.app.name).toBeUndefined();
  });

  it("should reassign without changing original", () => {
    const fakeName = faker.lorem.word();
    const reassigned = reassignEnvs({
      app: {
        name: fakeName,
      },
    });
    expect(reassigned.app.name).toBe(fakeName);
    expect(reassigned.app.env).toBe(envs.app.env);
    expect(envs.app.name).toBe("TEST-CQRS-APP");
  });
});
