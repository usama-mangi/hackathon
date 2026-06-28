import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl.startsWith('prisma+postgres://')) {
      super({
        accelerateUrl: dbUrl,
      });
      return this.$extends(withAccelerate()) as this;
    } else {
      super({
        adapter: new PrismaPg({
          connectionString: dbUrl
        })
      });
      return this;
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
