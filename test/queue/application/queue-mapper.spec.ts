import { faker } from "@faker-js/faker";

import { isValidQueue } from "@app/queue/application/queue-mapper";
import { QueueNames } from "@app/queue/application/queue-names";

describe("Queue Mapper", () => {
  describe("#isValidQueue", () => {
    it("should return true when queue is valid", () => {
      const queue = faker.helpers.arrayElement(QueueNames);

      const result = isValidQueue(queue);

      expect(result).toBe(true);
    });

    it("should return false when queue is invalid", () => {
      const invalidQueue = faker.random.alphaNumeric();

      expect(isValidQueue(invalidQueue)).toBe(false);
    });
  });
});
