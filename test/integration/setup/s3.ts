/* eslint-disable no-console */
import envs from "@test/load-envs";
import { Readable } from "stream";

import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { Optional, Option } from "@app/lib/optional";
import { Uuid } from "@app/lib/uuid";

export type ManagedS3 = Omit<S3TestStorage, "setUp" | "tearDown">;

export const runWithStorage = async (cb: (storage: ManagedS3) => Promise<void>) => {
  const storage = new S3TestStorage();
  await storage.setUp();
  await cb(storage).finally(() => storage.tearDown());
};

export class S3TestStorage {
  constructor(
    readonly bucket = `${envs.app.name}-${Uuid.generate().toString()}`,
    readonly endpoint = envs.s3.endpoint,
    private readonly client = new S3Client({
      endpoint,
      forcePathStyle: true,
    }),
  ) {}

  async setUp(): Promise<void> {
    const command = new CreateBucketCommand({
      Bucket: this.bucket,
    });

    await this.client.send(command).catch((err) => {
      console.log(err);
      throw err;
    });
  }

  async tearDown(): Promise<void> {
    await this.cleanBucket();
    await this.client.send(
      new DeleteBucketCommand({
        Bucket: this.bucket,
      }),
    );
  }

  async upload(key: string, body: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
      }),
    );
  }

  async objectExists(key: string): Promise<boolean> {
    return this.client
      .send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      )
      .then(() => true)
      .catch(() => false);
  }

  async getObject(key: string): Promise<Optional<Readable>> {
    const object = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    return Option(object.Body as Readable);
  }

  private async cleanBucket(): Promise<void> {
    const objects = await this.client.send(
      new ListObjectsCommand({
        Bucket: this.bucket,
      }),
    );

    if (objects.Contents === undefined) return;
    await Promise.all(
      objects.Contents.map(async (obj) => {
        await this.client.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: obj.Key,
          }),
        );
      }),
    );
  }
}
