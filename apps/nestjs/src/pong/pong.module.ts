import { Module } from '@nestjs/common';
import { MultiplayerPongGateway } from './multiplayerPong.gateway';
import { PowerUpPongGateway } from './powerUpPong.gateway';
import { UserModule } from '../user/user.module'; // Import UserModule

@Module({
  imports: [UserModule], // Import UserModule to access UserGateway
  providers: [PowerUpPongGateway, MultiplayerPongGateway],
})
export class PongModule {}