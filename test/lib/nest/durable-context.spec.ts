import { Controller, Get, INestApplication, Scope } from "@nestjs/common";
import { ContextIdFactory } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { DurableContextIdStrategy } from "@app/lib/nest/durable-context.strategy";
import { Injectable } from "@app/lib/nest/injectable";

@Injectable({ scope: Scope.DEFAULT })
class DefaultCounter {
  private count = 0;

  increaseAndGet(): number {
    return ++this.count;
  }
}

@Injectable()
class DurableCounter extends DefaultCounter {}

@Injectable({ scope: Scope.REQUEST, durable: false })
class RequestCounter extends DefaultCounter {}

@Controller("/counter")
class CounterController {
  constructor(private readonly counter: DurableCounter) {}

  @Get()
  get() {
    return {
      counter: this.counter.increaseAndGet(),
      ctor: this.constructor.name,
    };
  }
}

@Controller("/counter2")
class CounterController2 extends CounterController {}

@Controller("/counter3")
class CounterController3 extends CounterController {
  constructor(counter: DefaultCounter) {
    super(counter);
  }
}

@Controller("/counter4")
class CounterController4 extends CounterController {
  constructor(counter: RequestCounter) {
    super(counter);
  }
}

describe("durable-context", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [CounterController, CounterController2, CounterController3, CounterController4],
      providers: [DefaultCounter, DurableCounter, RequestCounter],
    }).compile();

    app = module.createNestApplication();
    ContextIdFactory.apply(new DurableContextIdStrategy());
    await app.init();
  });

  it("should keep same instance for all gets regardless controller", async () => {
    await request(app.getHttpServer()).get("/counter").expect(200);
    let response = await request(app.getHttpServer()).get("/counter").expect(200);
    expect(response.body).toStrictEqual({
      counter: 2,
      ctor: "CounterController",
    });

    response = await request(app.getHttpServer()).get("/counter2").expect(200);
    expect(response.body).toStrictEqual({
      counter: 3,
      ctor: "CounterController2",
    });
  });

  it("should create different instance when default scope", async () => {
    await request(app.getHttpServer()).get("/counter").expect(200);
    let response = await request(app.getHttpServer()).get("/counter").expect(200);
    expect(response.body).toStrictEqual({
      counter: 2,
      ctor: "CounterController",
    });

    response = await request(app.getHttpServer()).get("/counter3").expect(200);
    expect(response.body).toStrictEqual({
      counter: 1,
      ctor: "CounterController3",
    });
    response = await request(app.getHttpServer()).get("/counter3").expect(200);
    expect(response.body).toStrictEqual({
      counter: 2,
      ctor: "CounterController3",
    });
  });

  it("should create different instances each time when not durable", async () => {
    await request(app.getHttpServer()).get("/counter").expect(200);
    let response = await request(app.getHttpServer()).get("/counter").expect(200);
    expect(response.body).toStrictEqual({
      counter: 2,
      ctor: "CounterController",
    });

    response = await request(app.getHttpServer()).get("/counter4").expect(200);
    expect(response.body).toStrictEqual({
      counter: 1,
      ctor: "CounterController4",
    });
    response = await request(app.getHttpServer()).get("/counter4").expect(200);
    expect(response.body).toStrictEqual({
      counter: 1,
      ctor: "CounterController4",
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
