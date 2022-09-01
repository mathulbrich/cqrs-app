export interface StorageWriterOptions {
  readonly bucket: string;
  readonly key: string;
  readonly data: Buffer;
}

export abstract class StorageWriter {
  abstract write(options: StorageWriterOptions): Promise<void>;
}
