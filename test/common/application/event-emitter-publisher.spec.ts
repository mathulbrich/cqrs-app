import { INestApplication, Injectable } from "@nestjs/common";
import { EventEmitterModule, OnEvent } from "@nestjs/event-emitter";
import { Test } from "@nestjs/testing";

import { EventEmitterPublisher } from "@app/common/application/event-emitter-publisher";
import { EventPublisher } from "@app/common/domain/event-publisher";

class FakeSuccessfulEvent {
  constructor(readonly name: string) {}
}

class FakeFailedEvent {
  constructor(readonly name: string) {}
}

@Injectable()
class FakeService {
  successCalled = false;
  failCalled = false;
  processed = false;

  constructor(private readonly publisher: EventPublisher) {}

  async success(name = "fake"): Promise<void> {
    await this.publisher.publish(new FakeSuccessfulEvent(name));
    this.processed = true;
  }

  async fail(name = "fake"): Promise<void> {
    await this.publisher.publish(new FakeFailedEvent(name));
    this.processed = true;
  }

  @OnEvent(FakeSuccessfulEvent.name)
  async handleSuccess(_event: FakeSuccessfulEvent): Promise<void> {
    this.successCalled = true;
  }

  @OnEvent(FakeFailedEvent.name)
  async handleFail(event: FakeFailedEvent): Promise<void> {
    this.failCalled = true;
    throw new Error(`Failed to handle event ${event.name}`);
  }
}

describe(EventEmitterPublisher.name, () => {
  let app: INestApplication;
  let service: FakeService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: EventPublisher,
          useClass: EventEmitterPublisher,
        },
        FakeService,
      ],
      imports: [EventEmitterModule.forRoot()],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    service = app.get(FakeService);
  });

  it("should successfully handle event", async () => {
    await service.success();
    expect(service.successCalled).toBe(true);
    expect(service.failCalled).toBe(false);
    expect(service.processed).toBe(true);
  });

  it("should fail when event isn't processed", async () => {
    await expect(() => service.fail("failed")).rejects.toThrow("Failed to handle event failed");
    expect(service.successCalled).toBe(false);
    expect(service.failCalled).toBe(true);
    expect(service.processed).toBe(false);
  });

  afterEach(async () => {
    await app.close();
  });
});
