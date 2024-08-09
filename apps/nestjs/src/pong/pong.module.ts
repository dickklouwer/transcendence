import { Module } from '@nestjs/common';
import { MultiplayerPongGateway } from './multiplayerPong.gateway';
import { SingleplayerPongGateway } from './singleplayerPong.gateway';

@Module({
  providers: [SingleplayerPongGateway, MultiplayerPongGateway],
})
export class PongModule {}
