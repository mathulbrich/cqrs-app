import {
  ContextId,
  ContextIdFactory,
  ContextIdStrategy,
  HostComponentInfo,
} from "@nestjs/core";

const staticContextId = ContextIdFactory.create();

export class DurableContextIdStrategy implements ContextIdStrategy {
  attach(
    contextId: ContextId,
  ): ((info: HostComponentInfo) => ContextId) | undefined {
    return (info: HostComponentInfo) =>
      info.isTreeDurable ? staticContextId : contextId;
  }
}
