/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line no-restricted-imports
import { Logger as NestLogger } from "@nestjs/common";

export type LogLevel = "log" | "error" | "warn" | "debug" | "verbose";

export class Logger {
  private readonly internalLogger: NestLogger;

  constructor(private readonly context?: string) {
    this.internalLogger = new NestLogger(this.context ?? "app");
  }

  debug(message: unknown, ...optionalParams: [...any, string?]): void {
    this.callLog("debug", message, ...optionalParams);
  }

  log(message: unknown, ...optionalParams: [...any, string?]): void {
    this.callLog("log", message, ...optionalParams);
  }

  info(message: unknown, ...optionalParams: [...any, string?]): void {
    this.callLog("log", message, ...optionalParams);
  }

  trace(message: unknown, ...optionalParams: [...any, string?]): void {
    this.callLog("verbose", message, ...optionalParams);
  }

  verbose(message: unknown, ...optionalParams: [...any, string?]): void {
    this.callLog("verbose", message, ...optionalParams);
  }

  warn(message: unknown, ...optionalParams: [...any, string?]): void {
    this.callLog("warn", message, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: [...any, string?]): void {
    this.callLog("error", message, ...optionalParams);
  }

  private callLog(
    level: LogLevel,
    message: unknown,
    ...optionalParams: [...any, string?]
  ): void {
    if (optionalParams.length === 0) {
      this.internalLogger[level](message);
    } else if (
      optionalParams.length === 1 &&
      typeof optionalParams[0] !== "string"
    ) {
      this.internalLogger[level](
        this.buildLogObject(message, optionalParams[0]),
      );
    } else {
      this.internalLogger[level](message, ...optionalParams);
    }
  }

  private buildLogObject(msg: unknown, context: unknown): object {
    const msgObject = typeof msg === "object" ? msg : { msg };
    const contextObject = typeof context === "object" ? context : undefined;
    return {
      ...msgObject,
      ...contextObject,
    };
  }
}
