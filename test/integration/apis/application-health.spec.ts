import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { HttpAppModule } from "@app/http-app.module";

describe("Health", () => {
  let app: INestApplication;

  it("should successfully reach health endpoint", async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [HttpAppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    const response = await request(app.getHttpServer()).get("/health").expect(200);

    expect(response.body).toEqual({
      status: "OK",
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
