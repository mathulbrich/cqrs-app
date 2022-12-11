import { SQSMessageEvent } from "@app/queue/lambda/sqs-event";

describe("SQSMessageEvent", () => {
  it("should not allow more than one SQS message", () => {
    expect(() => SQSMessageEvent.parse({ Records: [{}, {}] })).toThrow(
      "More than one SQS message is not supported",
    );
  });

  it("should not allow no SQS message", () => {
    expect(() => SQSMessageEvent.parse({ Records: [] })).toThrow(
      "At least one SQS message is required",
    );
  });
});
