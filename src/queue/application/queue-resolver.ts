import { defaultTo, isObject } from "lodash";
import { ZodType, ZodTypeDef, z } from "zod";

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

type ErrorType = { message: string; code: string };
type ParserType<T> = ZodType<T, ZodTypeDef, unknown>;
type PayloadParseError<T> = z.inferFormattedError<ParserType<T>, ErrorType>;

export interface ResolverWithDataOptions<T> {
  data: object | string;
  dlq?: {
    customizePayload?: (payload: object, error: PayloadParseError<T>) => object;
    group?: string;
    messageId?: string;
    name: QueueName;
  };
  execute(data: T): Promise<void>;
  parser: ParserType<T>;
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

    resolves.forEach((event) => this.subscriber.subscribe(event, resolvedCallback));
    rejects.forEach((event) => this.subscriber.subscribe(event, rejectedCallback));

    await execute().finally(() => {
      resolves.forEach((event) => this.subscriber.unsubscribe(event, resolvedCallback));
      rejects.forEach((event) => this.subscriber.unsubscribe(event, rejectedCallback));
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
    const parsed = await parser.safeParseAsync(data);

    if (parsed.success) {
      return this.resolve({
        execute: async () => execute(parsed.data),
        rejects,
        resolves,
      });
    }
    this.logger.error("Error parsing data using parser. Ignoring invalid payload", {
      data,
      error: parsed.error,
      parser,
    });
    if (dlq) {
      const errorDetails = parsed.error.format((issue) => ({
        message: issue.message,
        code: issue.code,
      }));
      await this.enqueuer.enqueue({
        payload: isObject(data)
          ? defaultTo(dlq?.customizePayload?.(data, errorDetails), data)
          : data,
        messageId: dlq.messageId,
        queue: dlq.name,
        groupId: dlq.group,
      });
    }

    return Promise.resolve();
  }
}
