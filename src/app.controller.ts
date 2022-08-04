import { Controller, Get } from "@nestjs/common";

interface HealthResponse {
  status: string;
}

@Controller("health")
export class AppController {
  @Get()
  public healthCheck(): HealthResponse {
    return { status: "OK" };
  }
}
