import { ZodType, ZodTypeDef } from "zod";

import { EventSubscriber } from "@app/common/domain/event-subscriber";
import { Logger } from "@app/common/logging/logger";
import { Injectable } from "@app/lib/nest/injectable";
import { Newable } from "@app/lib/newable";
import { Enqueuer } from "@app/queue/application/enqueuer";
import { QueueName } from "@app/queue/application/queue-names";

interface ResolverOptions {
  execute: () => Promise<void>;
  resolves: Array<Newable<object>>;
  rejects: Array<Newable<object>>;
}

export interface ResolverWithDataOptions<T> {
  data: object;
  dlq?: {
    group?: string;
    messageId?: string;
    name: QueueName;
  };
  execute(data: T): Promise<void>;
  parser: ZodType<T, ZodTypeDef, unknown>;
  resolves: Array<Newable<object>>;
  rejects: Array<Newable<object>>;
}

@Injectable()
export class QueueResolver {
  private readonly logger = new Logger(QueueResolver.name);

  constructor(private readonly subscriber: EventSubscriber, private readonly enqueuer: Enqueuer) {}

  async resolve({ execute, resolves, rejects }: ResolverOptions): Promise<void> {
    let resolved = false;
    let rejected = false;
    const resolvedCallback = () => {
      resolved = true;
    };
    const rejectedCallback = () => {
      rejected = true;
    };

    for (const event of resolves) {
      this.subscriber.subscribe(event, resolvedCallback);
    }

    for (const event of rejects) {
      this.subscriber.subscribe(event, rejectedCallback);
    }

    await execute().finally(() => {
      for (const event of resolves) {
        this.subscriber.unsubscribe(event, resolvedCallback);
      }
      for (const event of rejects) {
        this.subscriber.unsubscribe(event, rejectedCallback);
      }
    });

    if (rejected || !resolved) {
      throw new Error("Queue execution resolves or rejects conditions were not met");
    }
  }

  async resolveWith<T>({
    data,
    dlq,
    execute,
    parser,
    resolves,
    rejects,
  }: ResolverWithDataOptions<T>): Promise<void> {
    try {
      const parsed = await parser.parseAsync(data);

      // eslint-disable-next-line @typescript-eslint/return-await
      return this.resolve({
        execute: async () => execute(parsed),
        rejects,
        resolves,
      });
    } catch (error) {
      this.logger.error("Error parsing data using parser. Ignoring invalid payload", {
        data,
        error,
        parser,
      });
      if (dlq) {
        await this.enqueuer.enqueue({
          payload: JSON.stringify(data),
          messageId: dlq.messageId,
          queue: dlq.name,
          groupId: dlq.group,
        });
      }

      return Promise.resolve();
    }
  }
}
