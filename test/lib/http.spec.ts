import { faker } from "@faker-js/faker";

import { redirectTo } from "@app/lib/http";

describe("Http", () => {
  it("#redirectTo", () => {
    const path = faker.random.word();

    expect(redirectTo(path)).toEqual({
      isBase64Encoded: false,
      statusCode: 302,
      multiValueHeaders: {
        Location: [path],
      },
      body: "",
    });
  });
});
