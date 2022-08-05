import {
  // eslint-disable-next-line no-restricted-imports
  Injectable as NestInjectable,
  Scope,
  ScopeOptions,
} from "@nestjs/common";

const defaultScope: ScopeOptions = { scope: Scope.REQUEST, durable: true };

export const Injectable = (scope = defaultScope) => NestInjectable(scope);
