import { MongooseModule } from '@nestjs/mongoose';
import { config } from '@app/config/config-load';

export const MoongoseModuleConfig = MongooseModule.forRootAsync({
  useFactory: () => ({
    uri: config.mongoDb.connectionUri,
    useNewUrlParser: true,
  }),
});
