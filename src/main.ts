/* eslint-disable @typescript-eslint/no-floating-promises */
import { bootstrap } from "@app/bootstrap";
import { AppConfigService } from "@app/config/app-config-service";

(async () => {
  const app = await bootstrap();
  app.listen(app.get(AppConfigService).app.port);
})();
