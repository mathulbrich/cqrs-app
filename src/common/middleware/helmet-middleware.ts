import helmet from "helmet";

import { SWAGGER_DOCS_ROUTE } from "@app/constants";
import {
  useMiddlewareOnlyFor,
  useMiddlewareExceptFor,
} from "@app/lib/middleware/use-middleware";

export const helmetMiddleware = () =>
  useMiddlewareExceptFor([SWAGGER_DOCS_ROUTE], helmet());

export const swaggerHelmetMiddleware = () =>
  useMiddlewareOnlyFor(
    [SWAGGER_DOCS_ROUTE],
    helmet({
      contentSecurityPolicy: {
        directives: {
          imgSrc: ["'self'", "data:", "unpkg.com"],
          scriptSrc: ["'self'", "https: 'unsafe-inline'"],
        },
      },
    }),
  );
