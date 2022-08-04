declare module "@vendia/serverless-express" {
  interface ServerlessExpress {
    createServer(app: any): any;
    proxy(server: any, event: any, context: any): unknown;
  }

  let serverlessExpress: ServerlessExpress;

  export = serverlessExpress;
}
