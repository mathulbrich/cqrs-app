import { QueueResolver } from "@app/queue/application/queue-resolver";
import { InMemoryPublisher } from "@test/resources/in-memory-publisher";

class TestArguments {
  readonly publisher = new InMemoryPublisher();
  readonly subscriber = this.publisher;
  readonly resolver = new QueueResolver(this.subscriber);
}

class ResolvedEvent {}
class ResolvedEvent2 {}

describe(QueueResolver.name, () => {
  it("should resolve when event is published", async () => {
    const { subscriber, publisher, resolver } = new TestArguments();

    await resolver.resolve({
      execute: () => publisher.publish(new ResolvedEvent()),
      resolves: [ResolvedEvent],
      rejects: [],
    });

    subscriber.singleOfType(ResolvedEvent);
    expect(subscriber.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(subscriber.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });

  it("should resolve when any of expected event is published", async () => {
    const { subscriber, publisher, resolver } = new TestArguments();

    await resolver.resolve({
      execute: () => publisher.publish(new ResolvedEvent2()),
      resolves: [ResolvedEvent, ResolvedEvent2],
      rejects: [],
    });

    subscriber.singleOfType(ResolvedEvent2);
    expect(subscriber.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(subscriber.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });

  it("should not resolve when the published event is not the expected one", async () => {
    const { subscriber, publisher, resolver } = new TestArguments();

    await expect(
      resolver.resolve({
        execute: () => publisher.publish(new ResolvedEvent()),
        resolves: [ResolvedEvent2],
        rejects: [],
      }),
    ).rejects.toThrow("Queue execution resolves or rejects conditions were not met");

    subscriber.singleOfType(ResolvedEvent);
    expect(subscriber.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(subscriber.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });

  it("should not resolve when no events are expected", async () => {
    const { subscriber, publisher, resolver } = new TestArguments();

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

    subscriber.ofTypes(ResolvedEvent, ResolvedEvent2);
    expect(subscriber.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(subscriber.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });

  it("should not resolve when rejected event is published", async () => {
    const { subscriber, publisher, resolver } = new TestArguments();

    await expect(
      resolver.resolve({
        execute: () => publisher.publish(new ResolvedEvent()),
        resolves: [],
        rejects: [ResolvedEvent],
      }),
    ).rejects.toThrow("Queue execution resolves or rejects conditions were not met");

    subscriber.singleOfType(ResolvedEvent);
    expect(subscriber.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(subscriber.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });

  it("should not resolve when any of rejected event is published", async () => {
    const { subscriber, publisher, resolver } = new TestArguments();

    await expect(
      resolver.resolve({
        execute: () => publisher.publish(new ResolvedEvent2()),
        resolves: [],
        rejects: [ResolvedEvent, ResolvedEvent2],
      }),
    ).rejects.toThrow("Queue execution resolves or rejects conditions were not met");

    subscriber.singleOfType(ResolvedEvent2);
    expect(subscriber.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(subscriber.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });

  it("should not reject when the published event is not the expected one", async () => {
    const { subscriber, publisher, resolver } = new TestArguments();

    await resolver.resolve({
      execute: () => publisher.publish(new ResolvedEvent2()),
      resolves: [ResolvedEvent2],
      rejects: [ResolvedEvent],
    });

    subscriber.singleOfType(ResolvedEvent2);
    expect(subscriber.totalOfListenersFor(ResolvedEvent)).toBe(0);
    expect(subscriber.totalOfListenersFor(ResolvedEvent2)).toBe(0);
  });
});
