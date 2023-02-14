import { reassignEnvs } from "@test/load-envs";

import { faker } from "@faker-js/faker";
import nock from "nock";

import { Uuid } from "@app/lib/uuid";
import { QueueNames } from "@app/queue/application/queue-names";
import { SQSEnqueuer } from "@app/queue/application/sqs-enqueuer";
import { SQSQueueUtil } from "@app/queue/application/sqs-queue-util";
import { sendBatchBadRequest, sendBatchSuccessfully } from "@test/resources/fixtures/sqs-request";

class ReceivedMessage {
  body?: Record<string, unknown>;
  queue?: string;
  getMessage(messageNumber: number) {
    return {
      MessageBody: this.body?.[`SendMessageBatchRequestEntry.${messageNumber}.MessageBody`],
      DelaySeconds: this.body?.[`SendMessageBatchRequestEntry.${messageNumber}.DelaySeconds`],
    };
  }
}

class TestArguments {
  readonly enqueuer: SQSEnqueuer;
  readonly queueUrl = faker.internet.url();
  readonly nockCall: nock.Scope;
  readonly received = new ReceivedMessage();

  constructor(sqsResponse = sendBatchSuccessfully) {
    const envs = reassignEnvs({
      queue: {
        sqsQueueEndpoint: this.queueUrl,
      },
    });
    this.enqueuer = new SQSEnqueuer(new SQSQueueUtil(envs), envs);
    this.nockCall = nock(this.queueUrl)
      .post("/", (body: Record<string, string>) => {
        this.received.body = body;
        this.received.queue = body.QueueUrl;
        return true;
      })
      .reply(200, sqsResponse);
  }
}

describe(SQSEnqueuer.name, () => {
  describe("#enqueue", () => {
    it("should send a message to queue", async () => {
      const { enqueuer, nockCall, received } = new TestArguments();
      const queue = faker.helpers.arrayElement(QueueNames);
      const payload = {
        id: Uuid.generate().toString(),
      };

      await enqueuer.enqueue({
        payload,
        queue,
      });

      expect(nockCall.isDone()).toBe(true);
      expect(received.getMessage(1).MessageBody).toEqual(JSON.stringify(payload));
      expect(received.queue).toContain(queue);
    });

    it("should send multiple messages to queue", async () => {
      const { enqueuer, nockCall, received } = new TestArguments();
      const queue = faker.helpers.arrayElement(QueueNames);
      const messages = [
        {
          payload: {
            message: "first",
            id: Uuid.generate().toString(),
          },
        },
        {
          payload: {
            message: "second",
            id: Uuid.generate().toString(),
          },
        },
      ];

      await enqueuer.enqueue({
        queue,
        messages,
      });

      expect(nockCall.isDone()).toBe(true);
      expect(received.getMessage(1).MessageBody).toEqual(JSON.stringify(messages[0].payload));
      expect(received.getMessage(2).MessageBody).toEqual(JSON.stringify(messages[1].payload));
      expect(received.queue).toContain(queue);
    });

    it("should throw an error when send message to queue fails", async () => {
      const { enqueuer, nockCall } = new TestArguments(sendBatchBadRequest);
      const queue = faker.helpers.arrayElement(QueueNames);
      const payload = {
        id: Uuid.generate().toString(),
      };

      await expect(async () =>
        enqueuer.enqueue({
          payload,
          queue,
        }),
      ).rejects.toThrow("Error sending 1 batch message(s) to SQS");

      expect(nockCall.isDone()).toBe(true);
    });

    it("should send a message without undefined props of object payload", async () => {
      const { enqueuer, nockCall, received } = new TestArguments();
      const payload = {
        id: Uuid.generate().toString(),
        name: undefined,
        date: new Date(),
      };

      await enqueuer.enqueue({
        payload,
        queue: faker.helpers.arrayElement(QueueNames),
      });

      expect(nockCall.isDone()).toBe(true);
      expect(received.getMessage(1).MessageBody).toEqual(
        JSON.stringify({
          id: payload.id,
          date: payload.date,
        }),
      );
    });

    it("should send a message without changes when payload is not a object", async () => {
      const { enqueuer, nockCall, received } = new TestArguments();
      const payload = faker.lorem.lines(1);

      await enqueuer.enqueue({
        payload,
        queue: faker.helpers.arrayElement(QueueNames),
      });
      expect(nockCall.isDone()).toBe(true);
      expect(received.getMessage(1).MessageBody).toEqual(payload);
    });

    it("should send delay seconds as undefined when receive a negative number", async () => {
      const { enqueuer, nockCall, received } = new TestArguments();
      const payload = faker.lorem.lines(1);

      await enqueuer.enqueue({
        payload,
        queue: faker.helpers.arrayElement(QueueNames),
        delaySeconds: faker.datatype.number() * -1,
      });
      expect(nockCall.isDone()).toBe(true);
      expect(received.body).toBeDefined();
      expect(received.getMessage(1).DelaySeconds).toBeUndefined();
    });

    it("should send delay seconds to queue", async () => {
      const { enqueuer, nockCall, received } = new TestArguments();
      const payload = faker.lorem.lines(1);
      const delaySeconds = faker.datatype.number();

      await enqueuer.enqueue({
        payload,
        queue: faker.helpers.arrayElement(QueueNames),
        delaySeconds,
      });

      expect(nockCall.isDone()).toBe(true);
      expect(received.body).toBeDefined();
      expect(received.getMessage(1).DelaySeconds).toEqual(String(delaySeconds));
    });
  });
});
