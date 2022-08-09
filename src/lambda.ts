/* eslint-disable @typescript-eslint/ban-ts-comment */
import serverlessExpress from "@vendia/serverless-express";
import { Context, Handler } from "aws-lambda";

import { bootstrap } from "@app/bootstrap";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler = async (event: any, context: Context, callback: any) => {
  const server = await getServer();

  if (event.path === "/docs/") {
    return redirectTo("/docs/swagger-ui");
  }

  return server(event, context, callback);
};
