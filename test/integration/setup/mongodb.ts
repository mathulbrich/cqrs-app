import { MongooseModule } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { Uuid } from "@app/lib/uuid";

export const mongoUri = (suffix: string) => {
  return `mongodb://admin:admin@mongodb/app-${suffix}?authSource=admin`;
};

export const mongooseTestConfig = (suffix: string) =>
  MongooseModule.forRootAsync({
    useFactory: () => ({
      uri: mongoUri(suffix),
      useNewUrlParser: true,
    }),
  });

export const dropDatabase = async (databaseSuffix: string) => {
  const mongo = await mongoose.connect(mongoUri(databaseSuffix));
  await mongo.connection.db
    .dropDatabase()
    .finally(() => mongo.connection.close());
};

export const connect = async (databaseSuffix: string) =>
  (await mongoose.connect(mongoUri(databaseSuffix))).connection;

export const runWithMongoConnection = async (
  cb: (connection: mongoose.Connection) => Promise<void>,
) => {
  const databaseSuffix = Uuid.generate().toString();
  const mongo = await mongoose.connect(mongoUri(databaseSuffix));
  await cb(mongo.connection)
    .finally(() => mongo.connection.db.dropDatabase())
    .finally(() => mongo.connection.close());
};
