import serverlessExpress from "@vendia/serverless-express";
import { Callback, Context, Handler } from "aws-lambda";
import { get } from "lodash";

import { bootstrap } from "@app/bootstrap";
import { SWAGGER_DOCS_ROUTE } from "@app/constants";
import { redirectTo } from "@app/lib/http";

let cachedServer: Handler;

const getServer = async (): Promise<Handler> => {
  if (!cachedServer) {
    const nestApp = await bootstrap();
    await nestApp.init();
    const app = nestApp.getHttpAdapter().getInstance();
    cachedServer = serverlessExpress({ app });
  }

  return cachedServer;
};

export const handler = async (event: unknown, context: Context, callback: Callback) => {
  const server = await getServer();

  if (get(event, "path") === `${SWAGGER_DOCS_ROUTE}/`) {
    return redirectTo(`${SWAGGER_DOCS_ROUTE}/swagger-ui`);
  }

  return server(event, context, callback);
};
