import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { AppConfigService } from "@app/common/config/app-config-service";
import { StorageWriter, StorageWriterOptions } from "@app/common/domain/storage-writer";
import { Logger } from "@app/common/logging/logger";
import { Injectable } from "@app/lib/nest/injectable";

@Injectable()
export class S3StorageWriter implements StorageWriter {
  private readonly logger = new Logger(S3StorageWriter.name);
  private readonly client: S3Client;

  constructor({ endpoint }: AppConfigService["s3"]) {
    this.client = new S3Client({
      endpoint,
      forcePathStyle: true,
    });
  }

  async write({ bucket, data, key }: StorageWriterOptions): Promise<void> {
    this.logger.log(`Uploading file to S3`, { bucket, key });

    await this.client
      .send(
        new PutObjectCommand({
          Body: data,
          Bucket: bucket,
          Key: key,
        }),
      )
      .finally(() => this.logger.debug("Uploaded file to S3", { bucket, key }));
  }
}
