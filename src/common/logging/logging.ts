import { randomUUID } from "crypto";

import { LoggerModule, Params } from "nestjs-pino";
import pino from "pino";

import { AppConfigService } from "@app/config/app-config-service";

type LoggerData = {
  app: Pick<AppConfigService["app"], "env" | "name">;
  logging: AppConfigService["logging"];
};

export const loggerConfig = (data: LoggerData): Params => ({
  pinoHttp: {
    autoLogging: false,
    base: undefined,
    quietReqLogger: true,
    name: data.app.name,
    formatters: { level: (level: string) => ({ level }) },
    level: data.logging.level,
    genReqId: (req) => req?.headers["x-request-id"] ?? randomUUID(),
    customAttributeKeys: {
      reqId: "requestId",
    },
    stream:
      /* istanbul ignore next */
      data.logging.async
        ? pino.destination({
            minLength: data.logging.minLength,
            sync: false,
          })
        : undefined,
    transport:
      data.app.env !== "dev"
        ? undefined
        : /* istanbul ignore next */ {
            target: "pino-pretty",
            options: {
              colorize: true,
              errorLikeObjectKeys: ["err", "error"],
              ignore: "pid,hostname,req,res,responseTime,context,requestId",
              levelFirst: false,
              messageFormat: "\t{requestId} [{context}] {msg}",
              singleLine: true,
              translateTime: "SYS:yyyy-mm-dd'T'HH:MM:ss.l'Z'",
            },
          },
  },
});

export const LoggingModuleConfig = LoggerModule.forRootAsync({
  inject: [AppConfigService],
  useFactory: (config: AppConfigService) => loggerConfig(config),
});
