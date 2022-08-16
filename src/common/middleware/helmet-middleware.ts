import helmet from "helmet";

import { SWAGGER_DOCS_ROUTE } from "@app/constants";
import { useMiddlewareExceptFor } from "@app/lib/middleware/use-middleware";

export const helmetMiddleware = () => useMiddlewareExceptFor([SWAGGER_DOCS_ROUTE], helmet());
