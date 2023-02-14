import { XOR } from "@app/lib/xor";
import { EnqueueArguments, EnqueueBatchArguments, Enqueuer } from "@app/queue/application/enqueuer";

export class DummyEnqueuer extends Enqueuer {
  private readonly enqueuedMessages = new Array<EnqueueArguments>();

  async enqueue(args: XOR<EnqueueArguments, EnqueueBatchArguments>): Promise<void> {
    const messages = (args.messages ?? [args]).map((message) => ({
      queue: args.queue,
      ...message,
    }));
    this.enqueuedMessages.push(...messages);
  }

  getEnqueuedMessages(): ReadonlyArray<EnqueueArguments> {
    return this.enqueuedMessages;
  }
}
