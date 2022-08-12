import { NextFunction, Request, RequestHandler, Response } from "express";

export class FakeMiddlewareArguments {
  private _nextWasCalled = false;

  private _forwardWasCalled = false;

  readonly request: Request = {
    headers: {},
    params: {},
    body: {},
  } as Request;

  readonly response: Response = {} as Response;

  readonly next: NextFunction = () => {
    this._nextWasCalled = true;
  };

  readonly forwardMiddleware: RequestHandler = (
    _req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    this._forwardWasCalled = true;
    next();
  };

  readonly nextWasCalled = () => this._nextWasCalled;

  readonly forwardWasCalled = () => this._forwardWasCalled;
}
