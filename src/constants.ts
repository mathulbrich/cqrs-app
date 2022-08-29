export const SWAGGER_DOCS_ROUTE = "/docs";
export const HEALTH_ROUTE = "/health";
export const REQUEST_ID_HEADER = "X-Request-Id";
export const IGNORED_ROUTES = [HEALTH_ROUTE, `${SWAGGER_DOCS_ROUTE}/(.*)`, "/favicon"];
export const SQS_QUEUE_CONTEXT = "SQS-QUEUE";
