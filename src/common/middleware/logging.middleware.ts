import { NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";

import { Logger } from "@app/common/logging/logger";
import { safeParse } from "@app/lib/json";

export class LoggingMiddleware implements NestMiddleware<Request, Response> {
  private readonly logger = new Logger("HTTP");

  use(request: Request, response: Response, next: (error?: unknown) => void) {
    const requestTime = Date.now();

    this.logger.debug("Request received", {
      httpData: {
        method: request.method,
        url: request.originalUrl,
        headers: request.headers,
        body: safeParse(request.body),
      },
    });

    const originalSend = response.send;
    response.send = (rawBody: unknown): Response => {
      const responseTime = Date.now() - requestTime;
      const { statusCode } = response;
      this.logger.debug("Response sent", {
        httpData: {
          headers: response.getHeaders(),
          statusCode,
          body: safeParse(rawBody),
          url: request.originalUrl,
          responseTime,
        },
      });

      response.send = originalSend;
      return response.send(rawBody);
    };

    return next();
  }
}
