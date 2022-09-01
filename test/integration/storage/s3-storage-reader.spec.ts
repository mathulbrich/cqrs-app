import { faker } from "@faker-js/faker";

import { S3StorageReader } from "@app/common/application/s3-storage-reader";
import { runWithStorage } from "@test/integration/setup/s3";
import { INTEGRATION_DEFAULT_TIMEOUT } from "@test/integration/setup/test-setup";
import { readableToString } from "@test/resources/readable";

describe(S3StorageReader.name, () => {
  jest.setTimeout(INTEGRATION_DEFAULT_TIMEOUT);

  it("should read file from bucket correctly", async () => {
    await runWithStorage(async (storage) => {
      const reader = new S3StorageReader({ endpoint: storage.endpoint });
      const testFile = faker.random.word();
      const content = faker.random.words(50);
      await storage.upload(testFile, content);

      const file = await reader.read({
        bucket: storage.bucket,
        key: testFile,
      });

      expect(file.isDefined()).toBe(true);
      expect(await readableToString(file.get())).toBe(content);
    });
  });

  it("should return None if file don't exist", async () => {
    await runWithStorage(async ({ bucket, endpoint }) => {
      const reader = new S3StorageReader({ endpoint });

      const file = await reader.read({
        bucket,
        key: faker.random.word(),
      });

      expect(file.isEmpty()).toBe(true);
    });
  });
});
