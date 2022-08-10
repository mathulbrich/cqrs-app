import { Controller, Get, INestApplication } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { Logger as PinoLogger, LoggerModule, Params } from "nestjs-pino";
import request from "supertest";

import { Logger } from "@app/common/logging/logger";
import { loggerConfig as defaultLoggerConfig } from "@app/common/logging/logging";
import { LoggingInterceptor } from "@app/common/logging/logging.interceptor";
import { wrapInContext } from "@app/common/logging/wrap-in-context";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

@Controller("/fake")
class FakeController {
  private readonly logger = new Logger(FakeController.name);

  @Get()
  get(): string {
    this.logger.log("Get called");
    return "ok";
  }

  @Get("error")
  fail(): string {
    this.logger.warn("Fail called");
    throw new Error("An annoying error");
  }
}

class FakeStream {
  messages: string[] = [];

  write(chunk: string): void {
    this.messages.push(chunk);
  }

  reset(): void {
    this.messages = [];
  }

  getLast(): { reqId: { requestId: string } } {
    return JSON.parse(this.messages[this.messages.length - 1]);
  }

  getAll(): object[] {
    return this.messages.map((message) => JSON.parse(message));
  }
}

describe("logger", () => {
  const stream = new FakeStream();
  let app: INestApplication;
  let loggerConfig: Params;

  beforeEach(async () => {
    loggerConfig = defaultLoggerConfig({
      app: {
        name: "test",
      },
      logging: {
        level: "trace",
        async: false,
      },
    });
    const module = await Test.createTestingModule({
      controllers: [FakeController],
      imports: [
        LoggerModule.forRoot({
          ...loggerConfig,
          pinoHttp: {
            ...loggerConfig.pinoHttp,
            transport: undefined,
            stream,
          },
        }),
      ],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: LoggingInterceptor,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useLogger(app.get(PinoLogger));
    stream.reset();
    await app.init();
  });

  it("should trace when verbose", async () => {
    const logger = new Logger("test-context");
    logger.verbose("A simple verbose message");
    expect(stream.getLast()).toEqual(
      expect.objectContaining({
        context: "test-context",
        level: "trace",
        msg: "A simple verbose message",
      }),
    );
  });

  it("should log with simple string", async () => {
    const logger = new Logger("test-context");
    logger.trace("A simple trace message");
    expect(stream.getLast()).toEqual(
      expect.objectContaining({
        context: "test-context",
        level: "trace",
        msg: "A simple trace message",
      }),
    );
  });

  it("should log with nested object", async () => {
    const logger = new Logger();
    logger.debug("A simple debug message", { anObject: { sub: "test" } });
    expect(stream.getLast()).toEqual(
      expect.objectContaining({
        context: "app",
        level: "debug",
        msg: "A simple debug message",
        anObject: { sub: "test" },
      }),
    );
  });

  it("should log with string param", async () => {
    const logger = new Logger("test-context");
    logger.info("A simple info message with param: %s", "test");
    expect(stream.getLast()).toEqual(
      expect.objectContaining({
        context: "test-context",
        level: "info",
        msg: "A simple info message with param: test",
      }),
    );
  });

  it("should log with two params as objects", () => {
    const logger = new Logger("test-context");
    logger.info({ test: "custom object" }, { another: true });
    expect(stream.getLast()).toEqual(
      expect.objectContaining({
        context: "test-context",
        level: "info",
        test: "custom object",
        another: true,
      }),
    );
  });

  it("should log with first param object and second string", () => {
    const logger = new Logger("test-context");
    logger.info({ test: "custom object" }, "another string");
    expect(stream.getLast()).toEqual(
      expect.objectContaining({
        context: "test-context",
        level: "info",
        test: "custom object",
        msg: "another string",
      }),
    );
  });

  it("should log with first param object and second not string", () => {
    const logger = new Logger("test-context");
    logger.info({ test: "custom object" }, true);
    expect(stream.getLast()).toEqual(
      expect.objectContaining({
        context: "test-context",
        level: "info",
        test: "custom object",
      }),
    );
  });

  describe("wrapInContext", () => {
    it("should wrap in context with random UUID", async () => {
      await wrapInContext(
        { loggerConfig: loggerConfig, executionContext: "wrapped" },
        async () => {
          const logger = new Logger("test-context");
          logger.info("A wrapped message");
          expect(stream.getLast()).toEqual(
            expect.objectContaining({
              context: "test-context",
              name: "wrapped",
              level: "info",
              msg: "A wrapped message",
              reqId: {
                requestId: expect.stringMatching(UUID_REGEX),
              },
            }),
          );
        },
      );
    });

    it("should wrap in context with given UUID", async () => {
      await wrapInContext(
        {
          loggerConfig: loggerConfig,
          requestId: "fixed-request-id",
        },
        async () => {
          const logger = new Logger("test-context");
          logger.info("A wrapped message");
          expect(stream.getLast()).toEqual(
            expect.objectContaining({
              context: "test-context",
              name: "test",
              level: "info",
              msg: "A wrapped message",
              reqId: {
                requestId: "fixed-request-id",
              },
            }),
          );
        },
      );
    });
  });

  describe("http calls", () => {
    it("should get x-request-id from HTTP request", async () => {
      await request(app.getHttpServer())
        .get("/fake")
        .set("x-request-id", "custom-correlation-id")
        .expect(200);
      expect(stream.getAll()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            context: "FakeController",
            level: "info",
            msg: "Get called",
            reqId: {
              requestId: "custom-correlation-id",
            },
          }),
        ]),
      );
    });

    it("should generate a new correlationId on empty header", async () => {
      await request(app.getHttpServer()).get("/fake").expect(200);
      expect(stream.getAll()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            context: "FakeController",
            level: "info",
            msg: "Get called",
            reqId: {
              requestId: expect.stringMatching(UUID_REGEX),
            },
          }),
        ]),
      );
    });

    it("should intercept and log errors when request fails", async () => {
      await request(app.getHttpServer()).get("/fake/error").expect(500);
      const requestId = stream.getLast().reqId.requestId;
      expect(requestId).toMatch(UUID_REGEX);
      expect(stream.getAll()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            context: "LoggingInterceptor",
            level: "debug",
            msg: "Request FakeController#fail",
            originalUrl: "/fake/error",
            reqId: {
              requestId,
            },
          }),
          expect.objectContaining({
            context: "FakeController",
            level: "warn",
            msg: "Fail called",
            reqId: {
              requestId,
            },
          }),
        ]),
      );
    });
  });

  afterEach(async () => {
    await app.close();
    app.flushLogs();
  });
});
