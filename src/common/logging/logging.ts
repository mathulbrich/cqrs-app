import { LoggerModule, Params } from "nestjs-pino";
import pino from "pino";
import { pinoLambdaDestination, PinoLogFormatter } from "pino-lambda";

import { AppConfigService } from "@app/config/app-config-service";
import { generateRequestId } from "@app/lib/request-id";

type LoggerData = {
  app: Pick<AppConfigService["app"], "env" | "name">;
  logging: AppConfigService["logging"];
};

type StreamType = { [key: string]: () => pino.DestinationStream | undefined };

/* istanbul ignore next */
const streams = (data: LoggerData): StreamType => ({
  async: () =>
    pino.destination({
      minLength: data.logging.minLength,
      sync: false,
    }),
  lambda: () =>
    pinoLambdaDestination({
      formatter: new PinoLogFormatter(),
    }),
  sync: () => undefined,
});

export const loggerConfig = (data: LoggerData): Params => ({
  pinoHttp: {
    autoLogging: false,
    base: undefined,
    quietReqLogger: true,
    name: data.app.name,
    formatters: { level: (level: string) => ({ level }) },
    level: data.logging.level,
    genReqId: (req) => generateRequestId(req?.headers),
    customAttributeKeys: {
      reqId: "requestId",
    },
    stream: streams(data)[data.logging.type](),
    transport:
      data.app.env !== "dev" && data.app.env !== "test"
        ? undefined
        : /* istanbul ignore next */ {
            target: "pino-pretty",
            options: {
              colorize: true,
              errorLikeObjectKeys: ["err", "error"],
              ignore: "pid,hostname,req,res,responseTime,context,requestId",
              levelFirst: false,
              messageFormat: "\t{requestId} [{context}] {msg}",
              // singleLine: true,
              translateTime: "SYS:yyyy-mm-dd'T'HH:MM:ss.l'Z'",
            },
          },
  },
});

export const LoggingModuleConfig = LoggerModule.forRootAsync({
  inject: [AppConfigService],
  useFactory: (config: AppConfigService) => loggerConfig(config),
});
