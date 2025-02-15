import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { PongModule } from './pong/pong.module';
import { ConfigModule } from '@nestjs/config';
import { MessagesGateway } from './messages/messages.gateway';
import { UserModule } from './user/user.module'; // Import UserModule

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    AuthModule,
    DbModule,
    PongModule,
    UserModule, // Add UserModule here
  ],
  controllers: [AppController],
  providers: [AppService, MessagesGateway], // Remove UserGateway and MultiplayerPongGateway from here
})
export class AppModule {}
