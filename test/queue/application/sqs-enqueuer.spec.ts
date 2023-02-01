import { reassignEnvs } from "@test/load-envs";
import { createHash } from "crypto";

import { faker } from "@faker-js/faker";
import nock from "nock";

import { Uuid } from "@app/lib/uuid";
import { SQSEnqueuer } from "@app/queue/application/sqs-enqueuer";
import { SQSQueueUtil } from "@app/queue/application/sqs-queue-util";

const randomUuid = () => Uuid.generate().toString();

const createHashMD5 = (data: string) => createHash("md5").update(data).digest("hex");

const getQueueResponse = (requestBody: string) =>
  `<SendMessageResponse>
    <SendMessageResult>
      <MD5OfMessageBody>${createHashMD5(requestBody)}</MD5OfMessageBody>
    </SendMessageResult>
  </SendMessageResponse>
`;
class TestArguments {
  readonly enqueuer: SQSEnqueuer;
  readonly queueUrl = faker.internet.url();
  constructor() {
    const envs = reassignEnvs({
      queue: {
        sqsQueueEndpoint: this.queueUrl,
      },
    });
    this.enqueuer = new SQSEnqueuer(new SQSQueueUtil(envs), envs);
  }
}

describe(SQSEnqueuer.name, () => {
  describe("#enqueue", () => {
    it("should send a message to queue", async () => {
      const { enqueuer, queueUrl } = new TestArguments();
      const queue = "create-example";
      const payload = {
        id: randomUuid(),
      };
      const responsePayload = getQueueResponse(JSON.stringify(payload));
      let receivedBody = "";
      let receivedQueue = "";
      const nockCall = nock(queueUrl)
        .post("/", (body: Record<string, string>) => {
          receivedBody = body.MessageBody;
          receivedQueue = body.QueueUrl;
          return true;
        })
        .reply(200, responsePayload);

      await enqueuer.enqueue({
        payload,
        queue,
      });
      expect(nockCall.isDone()).toBeTruthy();
      expect(receivedBody).toEqual(JSON.stringify(payload));
      expect(receivedQueue.includes(queue)).toBeTruthy();
    });

    it("should send a message without undefined props of object payload", async () => {
      const { enqueuer, queueUrl } = new TestArguments();
      const payload = {
        id: randomUuid(),
        name: undefined,
        date: new Date(),
      };
      const responsePayload = getQueueResponse(
        JSON.stringify({
          id: payload.id,
          date: payload.date,
        }),
      );
      let receivedBody = "";
      const nockCall = nock(queueUrl)
        .post("/", (body: Record<string, string>) => {
          receivedBody = body.MessageBody;
          return true;
        })
        .reply(200, responsePayload);
      await enqueuer.enqueue({
        payload,
        queue: "create-example",
      });

      expect(nockCall.isDone()).toBeTruthy();
      expect(receivedBody).toEqual(
        JSON.stringify({
          id: payload.id,
          date: payload.date,
        }),
      );
    });

    it("should send a message without changes when payload is not a object", async () => {
      const { enqueuer, queueUrl } = new TestArguments();
      const payload = faker.lorem.lines(1);
      const responsePayload = getQueueResponse(payload);
      let receivedBody = "";
      const nockCall = nock(queueUrl)
        .post("/", (body: Record<string, string>) => {
          receivedBody = body.MessageBody;
          return true;
        })
        .reply(200, responsePayload);

      await enqueuer.enqueue({
        payload,
        queue: "create-example",
      });
      expect(nockCall.isDone()).toBeTruthy();
      expect(receivedBody).toEqual(payload);
    });

    it("should send delay seconds as undefined when receive a negative number", async () => {
      const { enqueuer, queueUrl } = new TestArguments();
      const payload = faker.lorem.lines(1);
      let receivedBody: Record<string, unknown> = {};
      const nockCall = nock(queueUrl)
        .post("/", (body: Record<string, string>) => {
          receivedBody = body;
          return true;
        })
        .reply(200, getQueueResponse(payload));
      await enqueuer.enqueue({
        payload,
        queue: "create-example",
        delaySeconds: faker.datatype.number() * -1,
      });
      expect(nockCall.isDone()).toBeTruthy();
      expect(receivedBody.DelaySeconds).toEqual(undefined);
    });

    it("should send delay seconds to queue", async () => {
      const { enqueuer, queueUrl } = new TestArguments();
      const payload = faker.lorem.lines(1);
      const delaySeconds = faker.datatype.number();
      let receivedBody: Record<string, string> = {};
      const nockCall = nock(queueUrl)
        .post("/", (body: Record<string, string>) => {
          receivedBody = body;
          return true;
        })
        .reply(200, getQueueResponse(payload));
      await enqueuer.enqueue({
        payload,
        queue: "create-example",
        delaySeconds,
      });
      expect(nockCall.isDone()).toBeTruthy();
      expect(parseInt(receivedBody.DelaySeconds, 10)).toEqual(delaySeconds);
    });
  });
});
