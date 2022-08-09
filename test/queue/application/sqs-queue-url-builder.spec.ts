import { ConfigService } from "@nestjs/config";

import { AppConfigService } from "@app/config/app-config-service";
import { SQSQueueUrlBuilder } from "@app/queue/application/sqs-queue-url-builder";

class TestArguments {
  public readonly service = new ConfigService({
    queue: {
      sqsQueueBaseUrl: "http://queue/",
      sqsQueueSuffix: "-test-suffix",
    },
  });
  public readonly config = new AppConfigService(this.service);
  public readonly urlBuilder = new SQSQueueUrlBuilder(this.config);
}

describe(SQSQueueUrlBuilder.name, () => {
  it("should build url correctly", () => {
    const { urlBuilder } = new TestArguments();
    const queue = "any-queue";

    const url = urlBuilder.build(queue);

    expect(url).toBe("http://queue/any-queue-test-suffix");
  });
});
