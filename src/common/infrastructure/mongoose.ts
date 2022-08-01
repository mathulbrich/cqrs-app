import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MongoDBConfigService } from '@app/common/infrastructure/config/mongodb-config-service';

export const MoongoseModuleConfig = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (service: MongoDBConfigService) => ({
    uri: service.connectionUri,
    useNewUrlParser: true,
  }),
});
