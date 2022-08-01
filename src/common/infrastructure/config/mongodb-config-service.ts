/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoDBConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get connectionUri(): string {
    return this.configService.get<string>('mongoDb.connectionUri')!;
  }
}
