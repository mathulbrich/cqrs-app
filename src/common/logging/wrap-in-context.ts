import { randomUUID } from "crypto";

import { isNil } from "lodash";
import { Params, PinoLogger } from "nestjs-pino";
import { storage, Store } from "nestjs-pino/storage";

export type WrapParams = {
  loggerConfig: Params;
  executionContext?: string;
  requestId?: string;
};

export const wrapInContext = async (params: WrapParams, fn: () => Promise<void>): Promise<void> => {
  const contextName = isNil(params.executionContext) ? {} : { name: params.executionContext };
  const pinoLogger = new PinoLogger(params.loggerConfig);

  return storage.run(new Store(pinoLogger.logger), () => {
    pinoLogger.assign({
      requestId: params.requestId ?? randomUUID(),
      ...contextName,
    });
    return fn();
  });
};
