/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueueConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get queueHost(): string {
    return this.configService.get<string>('queue.queueHost')!;
  }

  public get queuePort(): number {
    return this.configService.get<number>('queue.queuePort')!;
  }

  public get queueProject(): string {
    return this.configService.get<string>('queue.queueProject')!;
  }

  public get queueRegion(): string {
    return this.configService.get<string>('queue.queueRegion')!;
  }

  public get queueHandlerUrl(): string {
    return this.configService.get<string>('queue.queueHandlerUrl')!;
  }
}
