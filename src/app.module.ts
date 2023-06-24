import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BuildController } from './build/build.controller';
import { BuildService } from './build/build.service';

@Module({
  imports: [],
  controllers: [AppController, BuildController],
  providers: [AppService, BuildService],
})
export class AppModule {}
