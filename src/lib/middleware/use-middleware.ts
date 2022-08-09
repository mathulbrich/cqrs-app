import { Request, RequestHandler, Response, NextFunction } from "express";

const matchSome = (url: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => url.match(pattern) !== null);
};

export const useMiddlewareExceptFor =
  (routes: string[], middleware: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void =>
    matchSome(req.url, routes) ? next() : middleware(req, res, next);

export const useMiddlewareOnlyFor =
  (routes: string[], middleware: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void =>
    !matchSome(req.url, routes) ? next() : middleware(req, res, next);
