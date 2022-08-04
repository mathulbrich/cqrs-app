/* eslint-disable @typescript-eslint/ban-ts-comment */
import serverlessExpress from "@vendia/serverless-express";

import { bootstrap } from "@app/bootstrap";

let app: unknown;

const createApp = async (): Promise<unknown> => {
  if (!app) {
    const nestApp = await bootstrap();
    await nestApp.init();
    app = nestApp.getHttpAdapter().getInstance();
  }

  return app;
};

export const handler = async (event: unknown, context: unknown) => {
  const app = await createApp();
  const server = serverlessExpress.createServer(app);
  return serverlessExpress.proxy(server, event, context);
};
