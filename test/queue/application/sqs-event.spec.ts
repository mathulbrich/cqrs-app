import { SQSMessageEvent } from "@app/queue/lambda/sqs-event";

describe("SQSMessageEvent", () => {
  it("should not allow more than one SQS message", () => {
    expect(() => SQSMessageEvent.parse({ Records: [{}, {}] })).toThrowError(
      "More than one SQS message is not supported",
    );
  });

  it("should not allow no SQS message", () => {
    expect(() => SQSMessageEvent.parse({ Records: [] })).toThrowError(
      "At least one SQS message is required",
    );
  });
});
