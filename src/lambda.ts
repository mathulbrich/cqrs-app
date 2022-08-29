import "source-map-support/register";
import { INestApplication } from "@nestjs/common";
import serverlessExpress from "@vendia/serverless-express";
import { Callback, Context, Handler } from "aws-lambda";
import { get } from "lodash";
import { lambdaRequestTracker, LambdaEvent } from "pino-lambda";

import { bootstrapHttpApp } from "@app/bootstrap";
import { SWAGGER_DOCS_ROUTE } from "@app/constants";
import { generateRequestId } from "@app/lib/request-id";
import { SQSMessageEvent } from "@app/queue/application/lambda/sqs-event";
import { SQSLambda } from "@app/queue/application/lambda/sqs-lambda";

let cachedServer: Handler;
let cachedApp: INestApplication;

const withRequest = lambdaRequestTracker({
  requestMixin: (event, context) => ({
    requestId: generateRequestId(event.headers),
    apiRequestId:
      context.awsRequestId === event.headers?.apiRequestId
        ? undefined
        : event.headers?.apiRequestId,
    "x-correlation-id": undefined,
    "x-correlation-trace-id": undefined,
  }),
});

const getServer = async (): Promise<Handler> => {
  if (!cachedServer) {
    cachedApp = await (await bootstrapHttpApp()).init();
    const app = cachedApp.getHttpAdapter().getInstance();
    cachedServer = serverlessExpress({ app });
  }

  return cachedServer;
};

export const handler = async (event: LambdaEvent, context: Context, callback: Callback) => {
  withRequest(event, context);
  const server = await getServer();

  if (get(event, "path") === `${SWAGGER_DOCS_ROUTE}/`) {
    return {
      isBase64Encoded: false,
      statusCode: 302,
      multiValueHeaders: {
        Location: [`${SWAGGER_DOCS_ROUTE}/swagger-ui`],
      },
      body: "",
    };
  }

  try {
    const sqsEvent = SQSMessageEvent.safeParse(event);
    if (sqsEvent.success) {
      const sqsLambda = await cachedApp.resolve(SQSLambda);
      return await sqsLambda.handle(sqsEvent.data);
    }

    return await server(event, context, callback);
  } finally {
    cachedApp.flushLogs();
  }
};
