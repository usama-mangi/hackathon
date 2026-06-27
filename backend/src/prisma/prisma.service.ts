import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // Prisma 7: pass the Accelerate URL directly to the constructor
      // for connection pooling and edge caching via Prisma Postgres.
      accelerateUrl: process.env.DATABASE_URL,
    });
    // Attach Accelerate extension for caching / result extensions
    return this.$extends(withAccelerate()) as this;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
