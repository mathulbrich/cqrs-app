import { Readable } from "stream";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { AppConfigService } from "@app/common/config/app-config-service";
import { StorageReader, StorageReaderOptions } from "@app/common/domain/storage-reader";
import { Logger } from "@app/common/logging/logger";
import { Injectable } from "@app/lib/nest/injectable";
import { Optional, None, Option } from "@app/lib/optional";

@Injectable()
export class S3StorageReader implements StorageReader {
  private readonly logger = new Logger(S3StorageReader.name);
  private readonly client: S3Client;

  constructor({ endpoint }: AppConfigService["s3"]) {
    this.client = new S3Client({
      endpoint,
      forcePathStyle: true,
    });
  }

  async read({ bucket, key }: StorageReaderOptions): Promise<Optional<Readable>> {
    this.logger.log("Requesting file from S3", { bucket, key });

    return this.client
      .send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      )
      .then((response) => {
        this.logger.debug("Requested file from S3", { bucket, key });

        return Option(response.Body as Readable);
      })
      .catch((error) => {
        this.logger.error("Failed to request file from S3", { bucket, key, error });

        return None();
      });
  }
}
