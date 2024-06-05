import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PongModule } from './pong/pong.module';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [PongModule],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
