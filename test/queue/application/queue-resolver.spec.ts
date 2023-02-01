import { faker } from "@faker-js/faker";
import { z } from "zod";

import { Uuid } from "@app/lib/uuid";
import { QueueResolver } from "@app/queue/application/queue-resolver";
import { DummyEnqueuer } from "@test/resources/dummy-enqueuer";
import { InMemoryPublisher } from "@test/resources/in-memory-publisher";

class TestArguments {
  readonly publisher = new InMemoryPublisher();
  readonly enqueuer = new DummyEnqueuer();
  readonly resolver = new QueueResolver(this.publisher, this.enqueuer);
}

const QueuePayload = z.object({ foo: z.string() });

class ResolvedEvent {
  constructor(readonly foo?: string) {}
}
class ResolvedEvent2 {}

describe(QueueResolver.name, () => {
  it("should resolve when event is published", async () => {
    const { publisher, resolver } = new TestArguments();

    await resolver.resolve({
      execute: async () => publisher.publish(new ResolvedEvent()),
      resolves: [ResolvedEvent],
      rejects: [],
    });

    publisher.singleOfType(ResolvedEvent);
    expect(publisher.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(publisher.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });

  it("should resolve when any of expected event is published", async () => {
    const { publisher, resolver } = new TestArguments();

    await resolver.resolve({
      execute: async () => publisher.publish(new ResolvedEvent2()),
      resolves: [ResolvedEvent, ResolvedEvent2],
      rejects: [],
    });

    publisher.singleOfType(ResolvedEvent2);
    expect(publisher.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(publisher.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });

  it("should not resolve when the published event is not the expected one", async () => {
    const { publisher, resolver } = new TestArguments();

    await expect(
      resolver.resolve({
        execute: async () => publisher.publish(new ResolvedEvent()),
        resolves: [ResolvedEvent2],
        rejects: [],
      }),
    ).rejects.toThrow("Queue execution resolves or rejects conditions were not met");

    publisher.singleOfType(ResolvedEvent);
    expect(publisher.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(publisher.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });

  it("should not resolve when no events are expected", async () => {
    const { publisher, resolver } = new TestArguments();

    await expect(
      resolver.resolve({
        execute: async () => {
          await publisher.publish(new ResolvedEvent());
          await publisher.publish(new ResolvedEvent2());
        },
        resolves: [],
        rejects: [],
      }),
    ).rejects.toThrow("Queue execution resolves or rejects conditions were not met");

    publisher.ofTypes(ResolvedEvent, ResolvedEvent2);
    expect(publisher.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(publisher.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });

  it("should not resolve when rejected event is published", async () => {
    const { publisher, resolver } = new TestArguments();

    await expect(
      resolver.resolve({
        execute: async () => publisher.publish(new ResolvedEvent()),
        resolves: [],
        rejects: [ResolvedEvent],
      }),
    ).rejects.toThrow("Queue execution resolves or rejects conditions were not met");

    publisher.singleOfType(ResolvedEvent);
    expect(publisher.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(publisher.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });

  it("should not resolve when any of rejected event is published", async () => {
    const { publisher, resolver } = new TestArguments();

    await expect(
      resolver.resolve({
        execute: async () => publisher.publish(new ResolvedEvent2()),
        resolves: [],
        rejects: [ResolvedEvent, ResolvedEvent2],
      }),
    ).rejects.toThrow("Queue execution resolves or rejects conditions were not met");

    publisher.singleOfType(ResolvedEvent2);
    expect(publisher.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(publisher.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });

  it("should not reject when the published event is not the expected one", async () => {
    const { publisher, resolver } = new TestArguments();

    await resolver.resolve({
      execute: async () => publisher.publish(new ResolvedEvent2()),
      resolves: [ResolvedEvent2],
      rejects: [ResolvedEvent],
    });

    publisher.singleOfType(ResolvedEvent2);
    expect(publisher.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(publisher.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });

  describe("#resolveWith", () => {
    it("should resolve with data without publish to DLQ", async () => {
      const { enqueuer, publisher, resolver } = new TestArguments();

      await resolver.resolveWith({
        execute: async (payload) => publisher.publish(new ResolvedEvent(payload.foo)),
        resolves: [ResolvedEvent],
        rejects: [],
        data: {
          foo: "bar",
        },
        parser: QueuePayload,
      });

      const published = publisher.singleOfType(ResolvedEvent);
      expect(published.foo).toBe("bar");
      expect(enqueuer.getEnqueuedMessages()).toHaveLength(0);
    });

    it("should resolve with invalid data without publish to DLQ", async () => {
      const { enqueuer, publisher, resolver } = new TestArguments();

      await resolver.resolveWith({
        execute: async (payload) => publisher.publish(new ResolvedEvent(payload.foo)),
        resolves: [ResolvedEvent],
        rejects: [],
        data: {
          foo: 123,
        },
        parser: QueuePayload,
      });

      expect(publisher.totalOfListenersFor(ResolvedEvent)).toBe(0);
      expect(enqueuer.getEnqueuedMessages()).toHaveLength(0);
    });

    it("should resolve with invalid data and publish to DLQ", async () => {
      const { enqueuer, publisher, resolver } = new TestArguments();
      const group = Uuid.generate().toString();
      const messageId = Uuid.generate().toString();

      await resolver.resolveWith({
        execute: async (payload) => publisher.publish(new ResolvedEvent(payload.foo)),
        resolves: [ResolvedEvent],
        rejects: [],
        data: {
          foo: 123,
        },
        parser: QueuePayload,
        dlq: {
          name: "create-example",
          group,
          messageId,
        },
      });

      expect(publisher.totalOfListenersFor(ResolvedEvent)).toBe(0);
      expect(enqueuer.getEnqueuedMessages()).toHaveLength(1);
      const enqueuedMessage = enqueuer.getEnqueuedMessages()[0];
      expect(enqueuedMessage.payload).toStrictEqual({ foo: 123 });
      expect(enqueuedMessage.queue).toBe("create-example");
      expect(enqueuedMessage.messageId).toBe(messageId);
      expect(enqueuedMessage.groupId).toBe(group);
    });

    it("should resolve with invalid payload and publish to DLQ with custom dlq payload", async () => {
      const { enqueuer, publisher, resolver } = new TestArguments();
      const group = Uuid.generate().toString();
      const messageId = Uuid.generate().toString();

      await resolver.resolveWith({
        execute: async (payload) => publisher.publish(new ResolvedEvent(payload.foo)),
        resolves: [ResolvedEvent],
        rejects: [],
        data: {
          foo: 123,
        },
        parser: QueuePayload,
        dlq: {
          name: "create-example",
          group,
          messageId,
          customizePayload: (payload, errorDetails) => ({
            ...payload,
            foo2: 456,
            errorDetails,
          }),
        },
      });

      expect(publisher.totalOfListenersFor(ResolvedEvent)).toBe(0);
      expect(enqueuer.getEnqueuedMessages()).toHaveLength(1);
      const enqueuedMessage = enqueuer.getEnqueuedMessages()[0];
      expect(enqueuedMessage.payload).toEqual({
        foo: 123,
        foo2: 456,
        errorDetails: {
          _errors: [],
          foo: {
            _errors: [
              {
                message: "Expected string, received number",
                code: "invalid_type",
              },
            ],
          },
        },
      });
      expect(enqueuedMessage.queue).toBe("create-example");
      expect(enqueuedMessage.messageId).toBe(messageId);
      expect(enqueuedMessage.groupId).toBe(group);
    });

    it("should resolve with invalid payload and publish to DLQ with errorDetails containing nested properties", async () => {
      const { enqueuer, publisher, resolver } = new TestArguments();
      const group = Uuid.generate().toString();
      const messageId = Uuid.generate().toString();
      const NestedQueuePayload = z.object({
        foo: z.object({
          bar: z
            .string()
            .min(10)
            .refine((v) => v.startsWith("bar"), "must start with bar"),
          foo: z.number(),
        }),
      });
      const data = {
        foo: {
          bar: "foo",
          foo: "foo",
        },
      };

      await resolver.resolveWith({
        execute: async (payload) => publisher.publish(payload),
        resolves: [ResolvedEvent],
        rejects: [],
        data,
        parser: NestedQueuePayload,
        dlq: {
          name: "create-example",
          group,
          messageId,
          customizePayload: (payload, errorDetails) => ({
            ...payload,
            errorDetails,
          }),
        },
      });

      expect(publisher.totalOfListenersFor(ResolvedEvent)).toBe(0);
      expect(enqueuer.getEnqueuedMessages()).toHaveLength(1);
      const enqueuedMessage = enqueuer.getEnqueuedMessages()[0];
      expect(enqueuedMessage.payload).toEqual({
        ...data,
        errorDetails: {
          _errors: [],
          foo: {
            _errors: [],
            foo: {
              _errors: [
                {
                  message: "Expected number, received string",
                  code: "invalid_type",
                },
              ],
            },
            bar: {
              _errors: [
                {
                  message: "String must contain at least 10 character(s)",
                  code: "too_small",
                },
                {
                  message: "must start with bar",
                  code: "custom",
                },
              ],
            },
          },
        },
      });
      expect(enqueuedMessage.queue).toBe("create-example");
      expect(enqueuedMessage.messageId).toBe(messageId);
      expect(enqueuedMessage.groupId).toBe(group);
    });

    it("should throw and not send to DLQ on execute error", async () => {
      const { enqueuer, resolver } = new TestArguments();

      await expect(
        resolver.resolveWith({
          execute: async () => {
            throw new Error("execute error");
          },
          resolves: [],
          rejects: [],
          data: { foo: "bar" },
          parser: QueuePayload,
          dlq: {
            name: "create-example",
          },
        }),
      ).rejects.toThrow("execute error");

      expect(enqueuer.getEnqueuedMessages()).toHaveLength(0);
    });

    it("should resolve with invalid payload and not send to DLQ when it's not provided", async () => {
      const { enqueuer, resolver } = new TestArguments();

      await resolver.resolveWith({
        execute: async () => {},
        resolves: [],
        rejects: [],
        data: { foo: faker.datatype.number() },
        parser: QueuePayload,
      });

      expect(enqueuer.getEnqueuedMessages()).toHaveLength(0);
    });

    it("should not customize payload when data is not an object", async () => {
      const { enqueuer, publisher, resolver } = new TestArguments();
      let customized = false;

      await resolver.resolveWith({
        execute: async (payload) => publisher.publish(new ResolvedEvent(payload.foo)),
        resolves: [ResolvedEvent],
        rejects: [],
        data: "blah",
        parser: QueuePayload,
        dlq: {
          name: "create-example",
          customizePayload: (payload) => {
            customized = true;
            return { ...payload, foo: "bar" };
          },
        },
      });

      expect(enqueuer.getEnqueuedMessages()).toHaveLength(1);
      expect(customized).toBe(false);
      const enqueuedMessage = enqueuer.getEnqueuedMessages()[0];
      expect(enqueuedMessage.payload).toEqual("blah");
    });
  });
});
