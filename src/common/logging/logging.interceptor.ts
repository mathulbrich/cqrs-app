import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  NestInterceptor,
  Scope,
} from "@nestjs/common";
import { catchError, Observable, tap, throwError } from "rxjs";

import { Logger } from "@app/common/logging/logger";
import { SWAGGER_DOCS_ROUTE, HEALTH_ROUTE } from "@app/constants";
import { Injectable } from "@app/lib/nest/injectable";

const IGNORED_URLS = [HEALTH_ROUTE, SWAGGER_DOCS_ROUTE];

@Injectable({ scope: Scope.DEFAULT })
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    /* istanbul ignore if */
    if (context.getType() !== "http") {
      return next.handle();
    }

    const requestTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const { originalUrl, method, params, query, body } = request;

    /* istanbul ignore if */
    if (IGNORED_URLS.includes(originalUrl)) {
      return next.handle();
    }

    this.logger.debug(
      `Request ${context.getClass().name}#${context.getHandler().name}`,
      {
        originalUrl,
        method,
        params,
        query,
        body,
      },
    );

    return next.handle().pipe(
      tap((data) => {
        const responseTimeMs = Date.now() - requestTime;
        const { statusCode } = context.switchToHttp().getResponse();
        this.logger.debug("Response", { statusCode, responseTimeMs, data });
      }),

      catchError((err) => {
        const responseTimeMs = Date.now() - requestTime;
        this.logger.error("Response error", {
          statusCode:
            err.status ?? err.code ?? HttpStatus.INTERNAL_SERVER_ERROR,
          responseTimeMs,
          err,
        });

        return throwError(() => err);
      }),
    );
  }
}
