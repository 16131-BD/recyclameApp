import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { DatabaseProvider } from './database.provider';

@Module({
  controllers: [DatabaseController],
  providers: [DatabaseService, ...DatabaseProvider],
  exports: [...DatabaseProvider]
})
export class DatabaseModule {}
