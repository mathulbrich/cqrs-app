import { reassignEnvs } from "@test/load-envs";

import { SQSQueueUtil } from "@app/queue/application/sqs-queue-util";

class TestArguments {
  readonly config = reassignEnvs({
    queue: {
      sqsQueueBaseUrl: "http://queue/",
      sqsQueueSuffix: "-test-suffix",
    },
  });
  readonly utils = new SQSQueueUtil(this.config);
}

describe(SQSQueueUtil.name, () => {
  it("should build url correctly", () => {
    const { utils } = new TestArguments();
    const queue = "any-queue";

    const url = utils.buildUrl(queue);

    expect(url).toBe("http://queue/any-queue-test-suffix");
  });

  it("should get queue from arn correctly", () => {
    const { utils } = new TestArguments();
    const queueARN = "arn:aws:sqs:us-east-1:123456789012:create-example-test-suffix";

    const queue = utils.getQueueFromArn(queueARN);

    expect(queue).toBe("create-example");
  });

  it("should throw error if queue is invalid", () => {
    const { utils } = new TestArguments();
    const queueARN = "arn:aws:sqs:us-east-1:123456789012:invalid-queue-test-suffix";

    expect(() => utils.getQueueFromArn(queueARN)).toThrowError("Invalid queue name: invalid-queue");
  });
});
