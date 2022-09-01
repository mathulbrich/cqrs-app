import { Readable } from "stream";

import { Optional } from "@app/lib/optional";

export interface StorageReaderOptions {
  readonly bucket: string;
  readonly key: string;
}

export abstract class StorageReader {
  abstract read(options: StorageReaderOptions): Promise<Optional<Readable>>;
}
