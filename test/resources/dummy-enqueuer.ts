import { EnqueueArguments, Enqueuer } from "@app/queue/application/enqueuer";

export class DummyEnqueuer extends Enqueuer {
  private readonly enqueuedMessages = new Array<EnqueueArguments>();

  async enqueue(args: EnqueueArguments): Promise<void> {
    this.enqueuedMessages.push(args);
  }

  getEnqueuedMessages(): ReadonlyArray<EnqueueArguments> {
    return this.enqueuedMessages;
  }
}
