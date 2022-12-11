import { faker } from "@faker-js/faker";

import { S3StorageWriter } from "@app/common/application/s3-storage-writer";
import { runWithStorage } from "@test/integration/setup/s3";
import { INTEGRATION_DEFAULT_TIMEOUT } from "@test/integration/setup/test-setup";
import { readableToString } from "@test/resources/readable";

describe(S3StorageWriter.name, () => {
  jest.setTimeout(INTEGRATION_DEFAULT_TIMEOUT);

  it("should write file into the bucket correctly", async () => {
    await runWithStorage(async (storage) => {
      const reader = new S3StorageWriter({ endpoint: storage.endpoint });
      const testFile = faker.random.word();
      const content = faker.random.words(50);

      await reader.write({
        bucket: storage.bucket,
        key: testFile,
        data: Buffer.from(content),
      });

      const file = await storage.getObject(testFile);
      expect(file.isDefined()).toBe(true);
      expect(await readableToString(file.get())).toBe(content);
    });
  });

  it("should throw error when bucket don't exist", async () => {
    await runWithStorage(async ({ endpoint }) => {
      const reader = new S3StorageWriter({ endpoint });
      const testFile = faker.random.word();
      const content = faker.random.words(50);
      const bucket = faker.random.alphaNumeric(12);

      await expect(
        reader.write({
          bucket,
          key: testFile,
          data: Buffer.from(content),
        }),
      ).rejects.toThrow("The specified bucket does not exist");
    });
  });
});
