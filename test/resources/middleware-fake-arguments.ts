import { NextFunction, Request, RequestHandler, Response } from "express";

export class FakeMiddlewareArguments {
  private _nextWasCalled = false;
  private _forwardWasCalled = false;
  public readonly request: Request = {
    headers: {},
    params: {},
    body: {},
  } as Request;
  public readonly response: Response = {} as Response;
  public readonly next: NextFunction = () => {
    this._nextWasCalled = true;
  };
  public readonly forwardMiddleware: RequestHandler = (
    _req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    this._forwardWasCalled = true;
    next();
  };
  public readonly nextWasCalled = () => this._nextWasCalled;
  public readonly forwardWasCalled = () => this._forwardWasCalled;
}
