import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from '@app/common/infrastructure/config/app-config-service';

export const MoongoseModuleConfig = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [AppConfigService],
  useFactory: (config: AppConfigService) => ({
    uri: config.mongoDb.connectionUri,
    useNewUrlParser: true,
  }),
});
