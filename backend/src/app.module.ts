import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MainModule } from './main/main.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [MainModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
