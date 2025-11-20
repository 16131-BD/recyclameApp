import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { DatabaseProvider } from './database.provider';
import { DatabaseUtil } from 'src/main/utils/database.util';
import { ModelProviders } from './providers/model.provider';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [DatabaseController],
  providers: [DatabaseService, ...DatabaseProvider, DatabaseUtil, ...ModelProviders, PrismaService],
  exports: [...DatabaseProvider, DatabaseUtil, ...ModelProviders, PrismaService]
})
export class DatabaseModule {}
