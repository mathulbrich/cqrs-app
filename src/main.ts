/* eslint-disable @typescript-eslint/no-floating-promises */
import "source-map-support/register";
import { bootstrap } from "@app/bootstrap";
import { AppConfigService } from "@app/common/config/app-config-service";

(async () => {
  const app = await bootstrap();
  app.listen(app.get(AppConfigService).app.port);
})();
