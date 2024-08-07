import { Module } from '@nestjs/common';
import { PongGateway } from './multiplayerPong.gateway';

@Module({
  providers: [PongGateway],
})
export class PongModule {}
