import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class AppController {
  @Get()
  public healthCheck(): void {
    // Just the health check endpoint
  }
}
