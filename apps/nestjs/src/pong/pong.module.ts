import { Module } from '@nestjs/common';
import { MultiplayerPongGateway } from './multiplayerPong.gateway';
import { PowerUpPongGateway } from './powerUpPong.gateway';

@Module({
  providers: [MultiplayerPongGateway, PowerUpPongGateway],
})
export class PongModule {}
