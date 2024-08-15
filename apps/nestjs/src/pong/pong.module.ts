import { Module } from '@nestjs/common';
import { MultiplayerPongGateway } from './multiplayerPong.gateway';
import { SingleplayerPongGateway } from './singleplayerPong.gateway';
import { PowerUpPongGateway } from './powerUpPong.gateway';

@Module({
  providers: [SingleplayerPongGateway, MultiplayerPongGateway, PowerUpPongGateway],
})
export class PongModule {}
