// src/database/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    private config: ConfigService
  ) {
    // 1. Leemos la URL antes del super()
    const url = config.get<string>("DATABASE_URL");
    if (!url) {
      throw new Error('DATABASE_URL no está definida en las variables de entorno');
    }

    // 2. Pasamos el adaptador al padre
    super({
      adapter: new PrismaPg({ connectionString: url }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}