/* eslint-disable @typescript-eslint/no-floating-promises */
import "source-map-support/register";
import { bootstrapHttpApp } from "@app/bootstrap";
import { AppConfigService } from "@app/common/config/app-config-service";

(async () => {
  const app = await bootstrapHttpApp();
  const port = app.get(AppConfigService).app.port;
  app.listen(port);
})();
