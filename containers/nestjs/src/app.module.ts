import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PongModule } from './pong/pong.module';

@Module({
  imports: [PongModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
