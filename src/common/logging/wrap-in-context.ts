import { randomUUID } from "crypto";

import { isNil } from "lodash";
import { Params, PinoLogger } from "nestjs-pino";
import { storage, Store } from "nestjs-pino/storage";

export type WrapParams = {
  loggerConfig: Params;
  executionContext?: string;
  requestId?: string;
};

export const wrapInContext = async (
  params: WrapParams,
  fn: () => Promise<void>,
): Promise<void> =>
  storage.run(new Store(PinoLogger.root), () => {
    const contextName = isNil(params.executionContext)
      ? {}
      : { name: params.executionContext };
    new PinoLogger(params.loggerConfig).assign({
      reqId: { requestId: params.requestId ?? randomUUID() },
      ...contextName,
    });
    return fn();
  });
