import { INestApplication } from "@nestjs/common";

export interface TestService {
  setUp(module: INestApplication): Promise<void>;
  tearDown(): Promise<void>;
}
