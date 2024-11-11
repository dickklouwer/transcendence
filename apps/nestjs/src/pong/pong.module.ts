import { Module } from '@nestjs/common';
import { MultiplayerPongGateway } from './multiplayerPong.gateway';
import { PowerUpPongGateway } from './powerUpPong.gateway';

@Module({
  providers: [PowerUpPongGateway, MultiplayerPongGateway],
})
export class PongModule {}
