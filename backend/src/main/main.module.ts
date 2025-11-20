import { Module } from '@nestjs/common';
import { MainService } from './main.service';
import { MainController } from './main.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants';

@Module({
  imports: [DatabaseModule, JwtModule.register({global: true, secret: jwtConstants.secret, signOptions: {expiresIn: '18000s'}})],
  controllers: [MainController],
  providers: [MainService],
})
export class MainModule {}
