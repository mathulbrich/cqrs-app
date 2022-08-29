import { Controller, Get } from "@nestjs/common";

interface HealthResponse {
  status: string;
}

@Controller("health")
export class HttpAppController {
  @Get()
  healthCheck(): HealthResponse {
    return { status: "OK" };
  }
}
