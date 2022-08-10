import {
  useMiddlewareExceptFor,
  useMiddlewareOnlyFor,
} from "@app/lib/middleware/use-middleware";
import { FakeMiddlewareArguments } from "@test/resources/middleware-fake-arguments";

const FAKE_URL = "/api/v1/test/abcd";

describe("use-middleware", () => {
  it("should not forward when url matches if useMiddlewareExceptFor was used", () => {
    const { request, response, next, forwardMiddleware, forwardWasCalled } =
      new FakeMiddlewareArguments();
    request.url = FAKE_URL;
    useMiddlewareExceptFor(["^/api/v1/test.*"], forwardMiddleware)(
      request,
      response,
      next,
    );
    expect(forwardWasCalled()).toBe(false);
  });

  it("should forward when url not matches if useMiddlewareExceptFor was used", () => {
    const { request, response, next, forwardMiddleware, forwardWasCalled } =
      new FakeMiddlewareArguments();
    request.url = FAKE_URL;
    useMiddlewareExceptFor(["^/api/v1/tests.*"], forwardMiddleware)(
      request,
      response,
      next,
    );
    expect(forwardWasCalled()).toBe(true);
  });

  it("should forward when url not matches if useMiddlewareOnlyFor was used", () => {
    const { request, response, next, forwardMiddleware, forwardWasCalled } =
      new FakeMiddlewareArguments();
    request.url = FAKE_URL;
    useMiddlewareOnlyFor(["^/api/v1/test.*"], forwardMiddleware)(
      request,
      response,
      next,
    );
    expect(forwardWasCalled()).toBe(true);
  });

  it("should not forward when url matches if useMiddlewareOnlyFor was used", () => {
    const { request, response, next, forwardMiddleware, forwardWasCalled } =
      new FakeMiddlewareArguments();
    request.url = FAKE_URL;
    useMiddlewareOnlyFor(["^/api/v2/test.*"], forwardMiddleware)(
      request,
      response,
      next,
    );
    expect(forwardWasCalled()).toBe(false);
  });
});
