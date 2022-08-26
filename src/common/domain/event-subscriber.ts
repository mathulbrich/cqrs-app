import { Newable } from "@app/lib/newable";

export type SubscriptionCallback<T extends object> = (event: T) => void;

export abstract class EventSubscriber {
  abstract subscribe<T extends object>(event: Newable<T>, callback: SubscriptionCallback<T>): void;
  abstract unsubscribe<T extends object>(
    event: Newable<T>,
    callback: SubscriptionCallback<T>,
  ): void;
}
