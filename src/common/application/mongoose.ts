import { MongooseModule } from "@nestjs/mongoose";

import { AppConfigService } from "@app/config/app-config-service";

export const MongooseModuleConfig = MongooseModule.forRootAsync({
  inject: [AppConfigService],
  useFactory: (config: AppConfigService) => ({
    uri: config.mongoDb.connectionUri,
    useNewUrlParser: true,
  }),
});
